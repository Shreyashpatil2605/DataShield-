#!/usr/bin/env python3
"""
PII Guard CLI
Usage:
  python -m cli.guard scan path/to/file.pdf
  python -m cli.guard scan path/to/file.pdf --mode mask --output redacted.txt
  python -m cli.guard text "My Aadhaar is 1234 5678 9012"
  python -m cli.guard batch ./documents/ --mode replace
"""

import json
import sys
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import print as rprint

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core import (
    extract_text,
    detect_pii,
    redact_text,
    RedactionMode,
    classify,
    explain,
)

app  = typer.Typer(help="PII Guard — detect and redact sensitive data from files.")
cons = Console()


def _print_results(result: dict, output_path: str | None = None):
    decision = result["decision"]
    risk     = decision["risk"]

    # Risk panel
    colour = {
        "safe": "green", "low": "yellow", "medium": "yellow",
        "high": "red", "critical": "bold red"
    }.get(risk["level"], "white")

    cons.print(Panel(
        f"[{colour}]Risk: {risk['level'].upper()}  |  Score: {risk['score']}/100[/{colour}]\n"
        f"{risk['message']}\n\n"
        f"Decision: {'[green]ALLOWED[/green]' if decision['allowed'] else '[red]BLOCKED[/red]'}",
        title="[bold]PII Guard Report[/bold]",
        expand=False,
    ))

    # Entity table
    if result["entities"]:
        table = Table(title="Detected Entities", show_lines=True)
        table.add_column("Label",  style="cyan",  no_wrap=True)
        table.add_column("Text",   style="yellow")
        table.add_column("Source", style="dim")
        table.add_column("Score",  justify="right")
        for e in result["entities"]:
            table.add_row(
                e["label"],
                e["text"][:40] + ("…" if len(e["text"]) > 40 else ""),
                e["source"],
                f"{e['score']:.2f}",
            )
        cons.print(table)

    # Explanations
    if result.get("explanations"):
        cons.print("\n[bold]Why these entities matter:[/bold]")
        for ex in result["explanations"]:
            sev_colour = {"critical":"red","high":"red","medium":"yellow","low":"dim"}.get(ex["severity"],"white")
            rprint(f"  [{sev_colour}]•[/{sev_colour}] [bold]{ex['what']}[/bold]: {ex['why']}")
            rprint(f"    [dim]Relevant law: {ex['law']}[/dim]")

    # Reasons
    for reason in decision.get("reasons", []):
        cons.print(f"\n[italic]{reason}[/italic]")

    # Output redacted file
    if output_path:
        Path(output_path).write_text(result["redacted_text"], encoding="utf-8")
        cons.print(f"\n[green]Redacted text saved to: {output_path}[/green]")
    else:
        cons.print("\n[bold]Redacted text:[/bold]")
        cons.print(result["redacted_text"][:2000])
        if len(result["redacted_text"]) > 2000:
            cons.print("[dim]… (truncated, use --output to save full text)[/dim]")


@app.command()
def scan(
    file_path: str = typer.Argument(..., help="Path to file (PDF, image, or text)"),
    mode: RedactionMode = typer.Option(RedactionMode.REPLACE, help="Redaction mode"),
    output: str = typer.Option(None, "--output", "-o", help="Save redacted text here"),
    no_ner: bool = typer.Option(False, "--no-ner", help="Skip NER (regex-only, faster)"),
    threshold: float = typer.Option(0.85, "--threshold", "-t", help="NER confidence threshold"),
    json_out: bool = typer.Option(False, "--json", help="Output raw JSON"),
):
    """Scan a single file for PII."""
    path = Path(file_path)
    if not path.exists():
        cons.print(f"[red]File not found: {file_path}[/red]")
        raise typer.Exit(1)

    with cons.status(f"Extracting text from {path.name}…"):
        text = extract_text(str(path))

    with cons.status("Detecting PII…"):
        entities = detect_pii(text, use_ner=not no_ner, ner_threshold=threshold)

    redacted, audit = redact_text(text, entities, mode)
    decision        = classify(entities)
    explanations    = explain(entities)

    result = {
        "filename":       path.name,
        "decision":       decision,
        "entities_found": len(entities),
        "entities":       [e.to_dict() for e in entities],
        "explanations":   explanations,
        "redacted_text":  redacted,
        "audit_log":      audit,
    }

    if json_out:
        print(json.dumps(result, indent=2))
    else:
        _print_results(result, output)


@app.command()
def text(
    input_text: str = typer.Argument(..., help="Text string to scan"),
    mode: RedactionMode = typer.Option(RedactionMode.REPLACE),
    no_ner: bool = typer.Option(False, "--no-ner"),
    json_out: bool = typer.Option(False, "--json"),
):
    """Scan a raw text string for PII."""
    entities        = detect_pii(input_text, use_ner=not no_ner)
    redacted, audit = redact_text(input_text, entities, mode)
    decision        = classify(entities)
    explanations    = explain(entities)

    result = {
        "decision": decision,
        "entities_found": len(entities),
        "entities": [e.to_dict() for e in entities],
        "explanations": explanations,
        "redacted_text": redacted,
        "audit_log": audit,
    }

    if json_out:
        print(json.dumps(result, indent=2))
    else:
        _print_results(result)


@app.command()
def batch(
    directory: str = typer.Argument(..., help="Directory containing files to scan"),
    mode: RedactionMode = typer.Option(RedactionMode.REPLACE),
    output_dir: str = typer.Option(None, "--output-dir", "-o"),
    no_ner: bool = typer.Option(False, "--no-ner"),
):
    """Batch-scan all supported files in a directory."""
    dir_path = Path(directory)
    if not dir_path.is_dir():
        cons.print(f"[red]Not a directory: {directory}[/red]")
        raise typer.Exit(1)

    exts = {".txt", ".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
    files = [f for f in dir_path.iterdir() if f.suffix.lower() in exts]

    if not files:
        cons.print("[yellow]No supported files found.[/yellow]")
        raise typer.Exit(0)

    out_path = Path(output_dir) if output_dir else None
    if out_path:
        out_path.mkdir(parents=True, exist_ok=True)

    summary = []
    for f in files:
        try:
            with cons.status(f"Scanning {f.name}…"):
                t = extract_text(str(f))
                ents = detect_pii(t, use_ner=not no_ner)
                redacted, _ = redact_text(t, ents, mode)
                dec = classify(ents)

            if out_path:
                (out_path / f"{f.stem}_redacted.txt").write_text(redacted)

            summary.append({
                "file": f.name,
                "entities": len(ents),
                "risk": dec["risk"]["level"],
                "allowed": dec["allowed"],
            })
        except Exception as e:
            summary.append({"file": f.name, "error": str(e)})

    table = Table(title="Batch Scan Summary")
    table.add_column("File")
    table.add_column("Entities", justify="right")
    table.add_column("Risk")
    table.add_column("Decision")

    for row in summary:
        if "error" in row:
            table.add_row(row["file"], "—", "—", f"[red]Error: {row['error']}[/red]")
        else:
            colour = "green" if row["allowed"] else "red"
            table.add_row(
                row["file"],
                str(row["entities"]),
                row["risk"],
                f"[{colour}]{'Allowed' if row['allowed'] else 'Blocked'}[/{colour}]",
            )

    cons.print(table)


if __name__ == "__main__":
    app()

package com.budgetbuddy.domain.report;

public class PdfTheme {
    // Colors
    public static final String COLOR_PRIMARY = "#1e293b";   // Slate 800 (Professional Text)
    public static final String COLOR_SECONDARY = "#64748b"; // Slate 500 (Muted Text)
    public static final String COLOR_ACCENT = "#2563eb";    // Blue 600 (Action/Logo)
    public static final String COLOR_SUCCESS = "#16a34a";   // Green 600
    public static final String COLOR_DANGER = "#dc2626";    // Red 600
    public static final String COLOR_BORDER = "#e2e8f0";    // Slate 200
    public static final String COLOR_BG_LIGHT = "#f8fafc";  // Slate 50
    public static final String COLOR_WHITE = "#ffffff";

    // Fonts
    public static final String FONT_FAMILY = "'Inter', 'Helvetica', sans-serif";
    public static final String FONT_SIZE_BASE = "10pt";
    public static final String FONT_SIZE_SMALL = "8pt";
    public static final String FONT_SIZE_H1 = "24pt";
    public static final String FONT_SIZE_H2 = "16pt";
    public static final String FONT_SIZE_H3 = "12pt";

    // Spacing
    public static final String PAGE_MARGIN = "40pt";
    public static final String SECTION_SPACING = "30pt";
    public static final String CARD_PADDING = "15pt";

    public static String getGlobalStyles() {
        return "body { font-family: " + FONT_FAMILY + "; color: " + COLOR_PRIMARY + "; margin: 0; padding: 0; line-height: 1.6; font-size: " + FONT_SIZE_BASE + "; }" +
               ".page { padding: " + PAGE_MARGIN + "; page-break-after: always; min-height: 100%; position: relative; }" +
               ".no-break { page-break-inside: avoid; }" +
               "h1 { font-size: " + FONT_SIZE_H1 + "; margin-bottom: 20pt; font-weight: 700; }" +
               "h2 { font-size: " + FONT_SIZE_H2 + "; margin-bottom: 12pt; font-weight: 600; color: " + COLOR_PRIMARY + "; border-bottom: 1px solid " + COLOR_BORDER + "; padding-bottom: 4pt; }" +
               "h3 { font-size: " + FONT_SIZE_H3 + "; margin-bottom: 8pt; font-weight: 600; }" +
               ".text-muted { color: " + COLOR_SECONDARY + "; }" +
               ".text-success { color: " + COLOR_SUCCESS + "; }" +
               ".text-danger { color: " + COLOR_DANGER + "; }" +
               ".text-accent { color: " + COLOR_ACCENT + "; }" +
               ".card { background: " + COLOR_WHITE + "; border: 1px solid " + COLOR_BORDER + "; border-radius: 4pt; padding: " + CARD_PADDING + "; margin-bottom: 15pt; }" +
               ".bg-light { background-color: " + COLOR_BG_LIGHT + "; }" +
               "table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }" +
               "th { text-align: left; color: " + COLOR_SECONDARY + "; font-size: " + FONT_SIZE_SMALL + "; text-transform: uppercase; letter-spacing: 0.05em; padding: 8pt 4pt; border-bottom: 1px solid " + COLOR_BORDER + "; }" +
               "td { padding: 8pt 4pt; border-bottom: 1px solid " + COLOR_BG_LIGHT + "; vertical-align: top; }" +
               ".metric-label { font-size: " + FONT_SIZE_SMALL + "; color: " + COLOR_SECONDARY + "; text-transform: uppercase; margin-bottom: 2pt; }" +
               ".metric-value { font-size: 14pt; font-weight: 700; }" +
               ".variation { font-size: 9pt; font-weight: 600; }" +
               ".footer { position: absolute; bottom: 20pt; left: " + PAGE_MARGIN + "; right: " + PAGE_MARGIN + "; border-top: 1px solid " + COLOR_BORDER + "; padding-top: 8pt; font-size: " + FONT_SIZE_SMALL + "; color: " + COLOR_SECONDARY + "; text-align: center; }";
    }
}

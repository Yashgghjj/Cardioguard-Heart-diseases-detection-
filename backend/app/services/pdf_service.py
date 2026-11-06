import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFReportService:
    @staticmethod
    def generate_assessment_pdf(assessment_data: dict, patient_data: dict) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        brand_blue = colors.HexColor("#1e3a8a")
        teal_accent = colors.HexColor("#0d9488")
        text_dark = colors.HexColor("#1e293b")
        gray_bg = colors.HexColor("#f8fafc")
        border_color = colors.HexColor("#cbd5e1")

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=brand_blue,
            spaceAfter=2
        )
        
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )

        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=brand_blue,
            spaceBefore=10,
            spaceAfter=6
        )

        normal_style = ParagraphStyle(
            "NormalDark",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=text_dark
        )

        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#b91c1c")
        )

        story = []

        # Header with Logo & Brand
        header_table = Table(
            [
                [
                    Paragraph("<b>CARDIOGUARD AI</b><br/><font size=8 color='#0d9488'>Advanced Heart Disease Detection & Risk Assessment Platform</font>", title_style),
                    Paragraph(f"<b>CONFIDENTIAL MEDICAL REPORT</b><br/>Ref: <b>{assessment_data.get('assessment_reference', 'N/A')}</b><br/>Date: {datetime.now().strftime('%b %d, %Y %H:%M')}", subtitle_style)
                ]
            ],
            colWidths=[4.0 * inch, 3.2 * inch]
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=2, spaceAfter=8))

        # Patient Info & Prediction Outcome Row
        prob = assessment_data.get("probability", 0.0)
        risk_level = assessment_data.get("risk_level", "lower").upper()
        if risk_level == "HIGHER":
            risk_color = colors.HexColor("#ef4444")
            risk_badge = "HIGHER ESTIMATED MODEL RISK"
        elif risk_level == "INTERMEDIATE":
            risk_color = colors.HexColor("#f59e0b")
            risk_badge = "INTERMEDIATE ESTIMATED MODEL RISK"
        else:
            risk_color = colors.HexColor("#10b981")
            risk_badge = "LOWER ESTIMATED MODEL RISK"

        patient_info = [
            [
                Paragraph("<b>Patient Identifier:</b>", normal_style),
                Paragraph(f"{patient_data.get('patient_code', 'PT-ANON')} ({patient_data.get('first_name', '')} {patient_data.get('last_name', '')})", normal_style),
                Paragraph("<b>Estimated Probability:</b>", normal_style),
                Paragraph(f"<b>{prob * 100:.1f}%</b>", normal_style),
            ],
            [
                Paragraph("<b>Age & Sex:</b>", normal_style),
                Paragraph(f"{int(assessment_data.get('age', 0))} yrs | {'Male' if assessment_data.get('sex') == 1 else 'Female'}", normal_style),
                Paragraph("<b>Risk Category:</b>", normal_style),
                Paragraph(f"<b><font color='{risk_color.hexval()}'>{risk_badge}</font></b>", normal_style),
            ],
            [
                Paragraph("<b>Assessed By:</b>", normal_style),
                Paragraph(f"{assessment_data.get('assessed_by_name', 'Healthcare Staff')}", normal_style),
                Paragraph("<b>Model Architecture:</b>", normal_style),
                Paragraph(f"{assessment_data.get('model_name', 'Logistic Regression')} ({assessment_data.get('model_version', 'v1.0.0')})", normal_style),
            ]
        ]

        summary_table = Table(patient_info, colWidths=[1.6 * inch, 2.2 * inch, 1.6 * inch, 1.8 * inch])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), gray_bg),
            ("BOX", (0, 0), (-1, -1), 1, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 12))

        # Clinical Features Table (13 inputs)
        story.append(Paragraph("<b>1. Clinical Assessment Parameters (UCI Benchmark)</b>", section_heading))
        
        cp_map = {1: "Typical Angina", 2: "Atypical Angina", 3: "Non-anginal Pain", 4: "Asymptomatic"}
        ecg_map = {0: "Normal", 1: "ST-T Abnormality", 2: "LV Hypertrophy"}
        slope_map = {1: "Upsloping", 2: "Flat", 3: "Downsloping"}
        thal_map = {3: "Normal", 6: "Fixed Defect", 7: "Reversable Defect"}

        features_data = [
            ["Clinical Parameter", "Observed Value", "Clinical Reference Standard", "Status"],
            ["Resting Blood Pressure (trestbps)", f"{assessment_data.get('trestbps')} mm Hg", "Normal: < 120 / Hypertensive: ≥ 130", "Elevated" if assessment_data.get('trestbps', 0) >= 130 else "Normal"],
            ["Serum Cholesterol (chol)", f"{assessment_data.get('chol')} mg/dl", "Desirable: < 200 / High: ≥ 240", "Elevated" if assessment_data.get('chol', 0) >= 200 else "Desirable"],
            ["Max Heart Rate (thalach)", f"{assessment_data.get('thalach')} bpm", "Stress test exercise tolerance peak", "Recorded"],
            ["Exercise Induced Angina (exang)", "Yes" if assessment_data.get('exang') == 1 else "No", "Ischemia indicator during physical exertion", "Observed" if assessment_data.get('exang') == 1 else "Absent"],
            ["ST Depression (oldpeak)", f"{assessment_data.get('oldpeak')} mm", "Baseline ST depression relative to rest", "Significant" if assessment_data.get('oldpeak', 0) >= 1.5 else "Mild/None"],
            ["Chest Pain Type (cp)", cp_map.get(int(assessment_data.get('cp', 1)), "Type 1"), "Clinical symptomatology classification", "Recorded"],
            ["Fasting Blood Sugar (fbs)", "> 120 mg/dl" if assessment_data.get('fbs') == 1 else "≤ 120 mg/dl", "Metabolic hyperglycemia indicator", "Elevated" if assessment_data.get('fbs') == 1 else "Normal"],
            ["Resting ECG (restecg)", ecg_map.get(int(assessment_data.get('restecg', 0)), "Normal"), "Baseline 12-lead electrocardiogram", "Abnormal" if assessment_data.get('restecg') != 0 else "Normal"],
            ["ST Segment Slope (slope)", slope_map.get(int(assessment_data.get('slope', 1)), "Flat"), "Peak exercise electrocardiographic vector", "Recorded"],
            ["Major Fluoroscopy Vessels (ca)", f"{int(assessment_data.get('ca', 0))} vessel(s)", "Major coronary vessel fluoroscopy score (0-3)", "Stenotic Marker" if assessment_data.get('ca', 0) > 0 else "Clear"],
            ["Thallium Perfusion (thal)", thal_map.get(int(assessment_data.get('thal', 3)), "Normal"), "Nuclear stress test myocardial perfusion scan", "Defect" if assessment_data.get('thal') in [6, 7] else "Normal"],
        ]

        feat_table = Table(features_data, colWidths=[2.2 * inch, 1.4 * inch, 2.4 * inch, 1.2 * inch])
        feat_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("BOX", (0, 0), (-1, -1), 1, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, gray_bg]),
        ]))
        story.append(feat_table)
        story.append(Spacer(1, 10))

        # Explainability & Contributing Factors
        story.append(Paragraph("<b>2. AI Model Explainability & Factor Attribution</b>", section_heading))
        contributions = assessment_data.get("feature_contributions") or []
        if contributions:
            contrib_rows = [["Factor", "Patient Measurement", "Attribution Impact", "Clinical Association"]]
            for c in contributions[:5]:
                direction = "Increases Model Risk" if c.get("direction") == "increases_risk" else "Decreases Model Risk"
                contrib_rows.append([
                    c.get("label", c.get("feature")),
                    str(c.get("display_value", "")),
                    f"{direction} ({c.get('impact', 0.0):+.2f})",
                    c.get("explanation", "")[:70] + "..."
                ])
            contrib_table = Table(contrib_rows, colWidths=[1.8 * inch, 1.4 * inch, 1.6 * inch, 2.4 * inch])
            contrib_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
                ("BOX", (0, 0), (-1, -1), 1, border_color),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, gray_bg]),
            ]))
            story.append(contrib_table)
        story.append(Spacer(1, 10))

        # Personalized Clinical Recommendations
        story.append(Paragraph("<b>3. Personalized Clinical Guidance & Educational Next Steps</b>", section_heading))
        recs = assessment_data.get("recommendations") or []
        for idx, r in enumerate(recs[:4], start=1):
            category = r.get("category", "General")
            title = r.get("title", "")
            desc = r.get("description", "")
            rec_text = f"<b>{idx}. [{category}] {title}:</b> {desc}"
            story.append(Paragraph(rec_text, normal_style))
            story.append(Spacer(1, 3))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=4, spaceAfter=6))

        # Medical Disclaimer Box
        disclaimer_box = Table(
            [[
                Paragraph(
                    "<b>LEGAL & MEDICAL DISCLAIMER:</b> This AI-generated risk assessment is developed strictly "
                    "for educational and decision-support research purposes. It is NOT a clinical medical diagnosis "
                    "or a substitute for evaluation by a licensed healthcare professional. Predictive associations "
                    "identified by machine learning models do not constitute definitive causal medical diagnoses.",
                    disclaimer_style
                )
            ]],
            colWidths=[7.2 * inch]
        )
        disclaimer_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#f87171")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(disclaimer_box)

        doc.build(story)
        buffer.seek(0)
        return buffer


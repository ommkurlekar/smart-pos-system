import csv
from io import StringIO, BytesIO
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# --- Helper to create general tables in PDF ---
def make_pdf(title, headers, data_rows):
    buffer = BytesIO()
    # Margins: 0.5 inch (36 points)
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name='TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#6366f1'),
        spaceAfter=15
    )
    
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 10))
    
    # Wrap text in paragraphs for cells to wrap properly
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=9, leading=11, textColor=colors.HexColor('#1e293b'))
    header_style = ParagraphStyle('HeaderStyle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.white)
    
    table_data = [[Paragraph(h, header_style) for h in headers]]
    for row in data_rows:
        table_data.append([Paragraph(str(x), body_style) for x in row])
        
    # Standard table widths logic: let reportlab compute, or specify proportional width
    # 540 total printable width for letter page with 36 margins
    col_width = 540 / len(headers)
    table = Table(table_data, colWidths=[col_width] * len(headers))
    
    t_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e1b4b')), # Indigo 950/900
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ])
    table.setStyle(t_style)
    story.append(table)
    
    doc.build(story)
    return buffer.getvalue()

# --- Helper to create Excel sheets ---
def make_excel(headers, data_rows):
    wb = Workbook()
    ws = wb.active
    ws.title = "Report"
    
    ws.append(headers)
    for row in data_rows:
        # Convert values to numbers if applicable
        formatted_row = []
        for val in row:
            if isinstance(val, (int, float)):
                formatted_row.append(val)
            else:
                try:
                    # try to parse as float
                    formatted_row.append(float(val))
                except (ValueError, TypeError):
                    formatted_row.append(val)
        ws.append(formatted_row)
        
    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()

# --- Helper to create CSV string bytes ---
def make_csv(headers, data_rows):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for row in data_rows:
        writer.writerow(row)
    return output.getvalue().encode('utf-8')

# --- Main report generation entries ---
def generate_forecast_report(products_data: list, file_format: str) -> bytes:
    headers = [
        "Product ID", "Product Name", "Category", 
        "Stock", "Reorder Level", "Predicted Demand (7 Days)", 
        "Sales Trend", "Reorder Rec", "Demand Status"
    ]
    data_rows = []
    for p in products_data:
        data_rows.append([
            p.get("id", ""),
            p.get("name", ""),
            p.get("category", ""),
            p.get("stock", 0),
            p.get("reorder_level", 10),
            p.get("predicted_demand", 0.0),
            p.get("sales_trend", "Stable"),
            p.get("reorder_recommendation", "Fully Stocked"),
            p.get("demand_status", "Low")
        ])
        
    if file_format == "csv":
        return make_csv(headers, data_rows)
    elif file_format == "excel":
        return make_excel(headers, data_rows)
    else: # pdf
        return make_pdf("Demand Forecasting Report", headers, data_rows)

def generate_customer_report(customers_data: list, file_format: str) -> bytes:
    headers = [
        "Customer ID", "Customer Name", "Contact Phone", 
        "Total Orders (Frequency)", "Total Purchase Amount (Monetary)", "Customer Segment"
    ]
    data_rows = []
    for c in customers_data:
        data_rows.append([
            c.get("id", ""),
            c.get("name", "N/A"),
            c.get("phone", ""),
            c.get("frequency", 0),
            c.get("monetary", 0.0),
            c.get("segment", "Unknown")
        ])
        
    if file_format == "csv":
        return make_csv(headers, data_rows)
    elif file_format == "excel":
        return make_excel(headers, data_rows)
    else: # pdf
        return make_pdf("Customer Segmentation CRM Report", headers, data_rows)

def generate_customer_card_pdf(customer_data: dict) -> bytes:
    buffer = BytesIO()
    # Page setup
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Title Styles
    title_style = ParagraphStyle(
        name='TitleStyle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#4f46e5'),
        alignment=1, # Center
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        name='SubTitleStyle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=1,
        textColor=colors.HexColor('#475569'),
        spaceAfter=25
    )
    
    normal_style = styles['Normal']
    normal_bold = ParagraphStyle('NormalBold', parent=normal_style, fontName='Helvetica-Bold')
    
    story.append(Paragraph("RETAIL CUSTOMER REPORT CARD", title_style))
    story.append(Paragraph("Smart POS Customer Analytics Engine", subtitle_style))
    
    # Table layout
    card_data = [
        [Paragraph("<b>Customer Name:</b>", normal_style), Paragraph(customer_data.get('name') or 'Customer Details Unspecified', normal_bold)],
        [Paragraph("<b>Contact Phone:</b>", normal_style), Paragraph(customer_data.get('phone') or 'N/A', normal_bold)],
        [Paragraph("<b>Customer ID:</b>", normal_style), Paragraph(customer_data.get('id') or 'N/A', normal_style)],
        [Paragraph("<b>AI Segment Category:</b>", normal_style), Paragraph(customer_data.get('segment') or 'Unknown', normal_bold)],
        [Paragraph("<b>Total Purchase Amount:</b>", normal_style), Paragraph(f"${customer_data.get('monetary', 0.0):.2f}", normal_bold)],
        [Paragraph("<b>Number of Orders (Frequency):</b>", normal_style), Paragraph(str(customer_data.get('frequency', 0)), normal_bold)],
    ]
    
    table = Table(card_data, colWidths=[180, 270])
    table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8fafc')),
    ]))
    
    story.append(table)
    
    story.append(Spacer(1, 40))
    
    # Add Segment explanation box
    seg = customer_data.get('segment', '')
    explanation = ""
    if seg == "Big Spenders":
        explanation = "This customer generates high revenue. Maintain engagement with personalized premium offers."
    elif seg == "Loyal":
        explanation = "This customer visits frequently. Keep customer satisfaction high with loyalty points and priority customer service."
    elif seg == "New":
        explanation = "This is a new customer. Send welcome discounts to encourage a repeat visit."
    elif seg == "At-Risk":
        explanation = "This customer has high value but hasn't visited in a while. Launch re-engagement campaigns."
    else:
        explanation = "Standard buyer profile. Target with standard promotional campaigns."
        
    desc_title_style = ParagraphStyle('DescTitle', parent=normal_bold, textColor=colors.HexColor('#1e1b4b'))
    desc_style = ParagraphStyle('DescStyle', parent=normal_style, fontSize=9, leading=12, textColor=colors.HexColor('#334155'))
    
    desc_data = [
        [Paragraph("<b>AI Segment Insight:</b>", desc_title_style)],
        [Paragraph(explanation, desc_style)]
    ]
    desc_table = Table(desc_data, colWidths=[450])
    desc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e0e7ff')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#818cf8')),
    ]))
    story.append(desc_table)
    
    story.append(Spacer(1, 50))
    footer_style = ParagraphStyle('Footer', parent=normal_style, alignment=1, textColor=colors.HexColor('#94a3b8'), fontSize=8)
    story.append(Paragraph("Smart POS System — Automated CRM Document Generation Engine", footer_style))
    
    doc.build(story)
    return buffer.getvalue()

import os
from PIL import Image, ImageDraw, ImageFont


def create_receipt_image(
    title: str,
    items: list,
    subtotal: float,
    tax: float,
    service_charge: float,
    tip: float,
    discount: float,
    total: float,
    currency: str,
    output_path: str
):
    """
    Generate a realistic synthetic thermal receipt image.
    """
    width = 400
    # Calculate required height based on content
    line_count = len(items) + 18
    height = max(550, line_count * 24 + 100)

    # White receipt paper background
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Use default bitmap font
    font = ImageFont.load_default()

    y = 20

    # Header
    draw.text((width // 2 - len(title) * 3, y), title.upper(), fill=(0, 0, 0), font=font)
    y += 20
    header_sub = "123 Innovation Way, Suite 400"
    draw.text((width // 2 - len(header_sub) * 3, y), header_sub, fill=(50, 50, 50), font=font)
    y += 18
    tel = "Tel: (555) 019-2834"
    draw.text((width // 2 - len(tel) * 3, y), tel, fill=(50, 50, 50), font=font)
    y += 24

    # Divider
    draw.line([(20, y), (width - 20, y)], fill=(150, 150, 150), width=1)
    y += 12

    # Receipt Metadata
    draw.text((20, y), "Order #: 40829", fill=(0, 0, 0), font=font)
    draw.text((width - 120, y), "Table: 04", fill=(0, 0, 0), font=font)
    y += 18
    draw.text((20, y), "Date: 2026-09-07", fill=(0, 0, 0), font=font)
    draw.text((width - 120, y), "Time: 20:45", fill=(0, 0, 0), font=font)
    y += 22

    # Column Headers
    draw.line([(20, y), (width - 20, y)], fill=(180, 180, 180), width=1)
    y += 8
    draw.text((20, y), "QTY  ITEM", fill=(0, 0, 0), font=font)
    draw.text((width - 90, y), "PRICE", fill=(0, 0, 0), font=font)
    y += 16
    draw.line([(20, y), (width - 20, y)], fill=(180, 180, 180), width=1)
    y += 12

    # Line Items
    for item in items:
        qty_str = f"{item['qty']:<4}"
        name_str = item["name"]
        price_str = f"{currency} {item['price']:.2f}"

        draw.text((20, y), f"{qty_str} {name_str}", fill=(0, 0, 0), font=font)
        draw.text((width - 20 - len(price_str) * 6, y), price_str, fill=(0, 0, 0), font=font)
        y += 20

    # Summary section
    y += 10
    draw.line([(20, y), (width - 20, y)], fill=(150, 150, 150), width=1)
    y += 12

    def draw_summary_line(label, val):
        nonlocal y
        val_str = f"{currency} {val:.2f}"
        draw.text((width - 220, y), label, fill=(0, 0, 0), font=font)
        draw.text((width - 20 - len(val_str) * 6, y), val_str, fill=(0, 0, 0), font=font)
        y += 18

    draw_summary_line("Subtotal:", subtotal)
    if discount > 0:
        draw_summary_line("Discount:", -discount)
    if tax > 0:
        draw_summary_line("Tax / GST:", tax)
    if service_charge > 0:
        draw_summary_line("Service Charge:", service_charge)
    if tip > 0:
        draw_summary_line("Tip / Gratuity:", tip)

    y += 6
    draw.line([(width - 220, y), (width - 20, y)], fill=(0, 0, 0), width=2)
    y += 10

    total_str = f"{currency} {total:.2f}"
    draw.text((width - 220, y), "TOTAL DUE:", fill=(0, 0, 0), font=font)
    draw.text((width - 20 - len(total_str) * 6, y), total_str, fill=(0, 0, 0), font=font)
    y += 28

    # Footer
    draw.line([(20, y), (width - 20, y)], fill=(150, 150, 150), width=1)
    y += 16
    footer_text = "THANK YOU FOR DINING WITH US!"
    draw.text((width // 2 - len(footer_text) * 3, y), footer_text, fill=(50, 50, 50), font=font)
    y += 16
    footer_sub = "www.digivalet-sample.com"
    draw.text((width // 2 - len(footer_sub) * 3, y), footer_sub, fill=(100, 100, 100), font=font)

    # Save image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image.save(output_path)
    print(f"Sample receipt saved to {output_path}")


def generate_all_samples():
    sample_dir = os.path.join(os.path.dirname(__file__), "samples")
    os.makedirs(sample_dir, exist_ok=True)

    # Sample 1: Cafe Bistro (INR)
    create_receipt_image(
        title="The Rustic Bean Cafe",
        items=[
            {"qty": 2, "name": "Cappuccino", "price": 440.00},
            {"qty": 1, "name": "Avocado Sourdough Toast", "price": 380.00},
            {"qty": 1, "name": "Blueberry Cheesecake", "price": 260.00},
            {"qty": 1, "name": "Sparkling Mineral Water", "price": 120.00}
        ],
        subtotal=1200.00,
        tax=60.00,
        service_charge=60.00,
        tip=0.00,
        discount=0.00,
        total=1320.00,
        currency="INR",
        output_path=os.path.join(sample_dir, "sample_receipt_cafe.png")
    )

    # Sample 2: Fine Dining Restaurant (USD)
    create_receipt_image(
        title="Trattoria Bella Vista",
        items=[
            {"qty": 1, "name": "Burrata Salad", "price": 18.50},
            {"qty": 2, "name": "Truffle Tagliatelle", "price": 56.00},
            {"qty": 1, "name": "Grilled Salmon", "price": 32.00},
            {"qty": 2, "name": "Chianti Classico Glass", "price": 28.00},
            {"qty": 1, "name": "Tiramisu", "price": 12.00}
        ],
        subtotal=146.50,
        tax=12.82,
        service_charge=0.00,
        tip=25.00,
        discount=10.00,
        total=174.32,
        currency="USD",
        output_path=os.path.join(sample_dir, "sample_receipt_restaurant.png")
    )

    # Sample 3: Gourmet Grocery (INR)
    create_receipt_image(
        title="Organic Grocers Market",
        items=[
            {"qty": 2, "name": "Almond Milk 1L", "price": 400.00},
            {"qty": 1, "name": "Organic Honey 500g", "price": 350.00},
            {"qty": 3, "name": "Greek Yogurt Cups", "price": 210.00},
            {"qty": 1, "name": "Artisan Sourdough", "price": 150.00}
        ],
        subtotal=1110.00,
        tax=55.50,
        service_charge=0.00,
        tip=0.00,
        discount=50.00,
        total=1115.50,
        currency="INR",
        output_path=os.path.join(sample_dir, "sample_receipt_grocery.png")
    )


if __name__ == "__main__":
    generate_all_samples()

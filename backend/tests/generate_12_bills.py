import os
import math
from PIL import Image, ImageDraw, ImageFont


def create_receipt_image(
    title: str,
    subtitle: str,
    order_num: str,
    date_str: str,
    items: list,
    subtotal: float,
    tax: float,
    service_charge: float,
    tip: float,
    discount: float,
    total: float,
    currency: str,
    output_path: str,
    style: str = "standard"
):
    width = 440
    line_count = len(items) + 20
    height = max(580, line_count * 24 + 120)

    if style == "dim_lighting":
        bg_color = (190, 185, 175)
        text_color = (30, 25, 20)
        sub_text_color = (70, 65, 60)
        line_color = (130, 125, 115)
    elif style == "thermal_faded":
        bg_color = (250, 248, 242)
        text_color = (110, 105, 100)
        sub_text_color = (140, 135, 130)
        line_color = (210, 205, 200)
    else:
        bg_color = (255, 255, 255)
        text_color = (0, 0, 0)
        sub_text_color = (60, 60, 60)
        line_color = (160, 160, 160)

    image = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    y = 24

    draw.text((width // 2 - len(title) * 3, y), title.upper(), fill=text_color, font=font)
    y += 20
    if subtitle:
        draw.text((width // 2 - len(subtitle) * 3, y), subtitle, fill=sub_text_color, font=font)
        y += 18

    tel = "Tel: +1 (555) 019-2834"
    draw.text((width // 2 - len(tel) * 3, y), tel, fill=sub_text_color, font=font)
    y += 24

    draw.line([(20, y), (width - 20, y)], fill=line_color, width=1)
    y += 12

    draw.text((20, y), f"Order #: {order_num}", fill=text_color, font=font)
    draw.text((width - 130, y), "Table: 04", fill=text_color, font=font)
    y += 18
    draw.text((20, y), f"Date: {date_str}", fill=text_color, font=font)
    draw.text((width - 130, y), "Time: 20:45", fill=text_color, font=font)
    y += 22

    draw.line([(20, y), (width - 20, y)], fill=line_color, width=1)
    y += 8
    draw.text((20, y), "QTY  ITEM DESCRIPTION", fill=text_color, font=font)
    draw.text((width - 100, y), "PRICE", fill=text_color, font=font)
    y += 16
    draw.line([(20, y), (width - 20, y)], fill=line_color, width=1)
    y += 12

    for item in items:
        qty_str = f"{item['qty']:<4}"
        name_str = item["name"]
        price_str = f"{currency} {item['price']:.2f}"

        draw.text((20, y), f"{qty_str} {name_str}", fill=text_color, font=font)
        draw.text((width - 20 - len(price_str) * 6, y), price_str, fill=text_color, font=font)
        y += 20

    y += 10
    draw.line([(20, y), (width - 20, y)], fill=line_color, width=1)
    y += 12

    def draw_summary_line(label, val, negative=False):
        nonlocal y
        val_str = f"{'-' if negative else ''}{currency} {abs(val):.2f}"
        draw.text((width - 240, y), label, fill=text_color, font=font)
        draw.text((width - 20 - len(val_str) * 6, y), val_str, fill=text_color, font=font)
        y += 18

    draw_summary_line("Subtotal:", subtotal)
    if discount > 0:
        draw_summary_line("Discount / Promo:", discount, negative=True)
    if tax > 0:
        draw_summary_line("Tax / GST:", tax)
    if service_charge > 0:
        draw_summary_line("Service Charge:", service_charge)
    if tip > 0:
        draw_summary_line("Tip / Gratuity:", tip)

    y += 6
    draw.line([(width - 240, y), (width - 20, y)], fill=text_color, width=2)
    y += 10

    total_str = f"{currency} {total:.2f}"
    draw.text((width - 240, y), "TOTAL DUE:", fill=text_color, font=font)
    draw.text((width - 20 - len(total_str) * 6, y), total_str, fill=text_color, font=font)
    y += 28

    draw.line([(20, y), (width - 20, y)], fill=line_color, width=1)
    y += 16
    footer_text = "THANK YOU FOR YOUR VISIT!"
    draw.text((width // 2 - len(footer_text) * 3, y), footer_text, fill=sub_text_color, font=font)
    y += 16
    footer_sub = "www.digivalet-bills.com"
    draw.text((width // 2 - len(footer_sub) * 3, y), footer_sub, fill=sub_text_color, font=font)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image.save(output_path)
    print(f"Generated [{style}] bill: {output_path}")


def generate_12_test_bills():
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test-bills"))
    os.makedirs(output_dir, exist_ok=True)

    test_cases = [
        {
            "filename": "bill_01_cafe_bistro.png",
            "title": "The Rustic Bean Cafe",
            "subtitle": "MG Road, Indiranagar, Bengaluru",
            "order": "1001",
            "date": "2026-09-01",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 2, "name": "Cappuccino", "price": 440.00},
                {"qty": 1, "name": "Avocado Sourdough Toast", "price": 380.00},
                {"qty": 1, "name": "Blueberry Cheesecake", "price": 260.00},
                {"qty": 1, "name": "Sparkling Water", "price": 120.00}
            ],
            "subtotal": 1200.00,
            "tax": 60.00,
            "service_charge": 60.00,
            "tip": 0.00,
            "discount": 0.00,
            "total": 1320.00
        },
        {
            "filename": "bill_02_fine_dining_usd.png",
            "title": "Trattoria Bella Vista",
            "subtitle": "5th Avenue, New York, NY",
            "order": "2042",
            "date": "2026-09-02",
            "currency": "USD",
            "style": "standard",
            "items": [
                {"qty": 1, "name": "Burrata Salad", "price": 18.50},
                {"qty": 2, "name": "Truffle Tagliatelle", "price": 56.00},
                {"qty": 1, "name": "Grilled Salmon", "price": 32.00},
                {"qty": 2, "name": "Chianti Glass", "price": 28.00},
                {"qty": 1, "name": "Tiramisu", "price": 12.00}
            ],
            "subtotal": 146.50,
            "tax": 12.82,
            "service_charge": 0.00,
            "tip": 25.00,
            "discount": 10.00,
            "total": 174.32
        },
        {
            "filename": "bill_03_gourmet_grocery.png",
            "title": "Organic Grocers Market",
            "subtitle": "Koramangala 4th Block, Bengaluru",
            "order": "3089",
            "date": "2026-09-03",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 2, "name": "Almond Milk 1L", "price": 400.00},
                {"qty": 1, "name": "Organic Honey 500g", "price": 350.00},
                {"qty": 3, "name": "Greek Yogurt Cups", "price": 210.00},
                {"qty": 1, "name": "Artisan Sourdough", "price": 150.00}
            ],
            "subtotal": 1110.00,
            "tax": 55.50,
            "service_charge": 0.00,
            "tip": 0.00,
            "discount": 50.00,
            "total": 1115.50
        },
        {
            "filename": "bill_04_fast_food_counter.png",
            "title": "Burger & Fry Express",
            "subtitle": "Terminal 2 Food Court",
            "order": "4012",
            "date": "2026-09-04",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 2, "name": "Double Smash Burger", "price": 500.00},
                {"qty": 2, "name": "Large Peri Peri Fries", "price": 240.00},
                {"qty": 2, "name": "Classic Chocolate Shake", "price": 320.00}
            ],
            "subtotal": 1060.00,
            "tax": 53.00,
            "service_charge": 0.00,
            "tip": 0.00,
            "discount": 0.00,
            "total": 1113.00
        },
        {
            "filename": "bill_05_cocktail_lounge.png",
            "title": "Aero Sky Lounge",
            "subtitle": "Rooftop 24, UB City",
            "order": "5120",
            "date": "2026-09-04",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 2, "name": "Smoked Old Fashioned", "price": 1400.00},
                {"qty": 2, "name": "Espresso Martini", "price": 1200.00},
                {"qty": 1, "name": "Truffle Fries Basket", "price": 450.00},
                {"qty": 1, "name": "Artisanal Cheese Board", "price": 850.00}
            ],
            "subtotal": 3900.00,
            "tax": 195.00,
            "service_charge": 390.00,
            "tip": 200.00,
            "discount": 0.00,
            "total": 4685.00
        },
        {
            "filename": "bill_06_pizza_parlor.png",
            "title": "Crust & Craft Pizzeria",
            "subtitle": "Church Street, Bengaluru",
            "order": "6031",
            "date": "2026-09-05",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 1, "name": "14 inch Pepperoni Feast", "price": 750.00},
                {"qty": 1, "name": "14 inch Quattro Formaggi", "price": 720.00},
                {"qty": 1, "name": "Garlic Dough Balls", "price": 220.00},
                {"qty": 3, "name": "Craft IPA Pint", "price": 1050.00}
            ],
            "subtotal": 2740.00,
            "tax": 137.00,
            "service_charge": 274.00,
            "tip": 0.00,
            "discount": 150.00,
            "total": 3001.00
        },
        {
            "filename": "bill_07_dim_lighting_thermal.png",
            "title": "Midnight Diner & Pub",
            "subtitle": "Dim Lighting Test Case",
            "order": "7092",
            "date": "2026-09-05",
            "currency": "INR",
            "style": "dim_lighting",
            "items": [
                {"qty": 2, "name": "Loaded Nachos Supreme", "price": 640.00},
                {"qty": 2, "name": "Draft Pitcher Blonde", "price": 950.00},
                {"qty": 1, "name": "Buffalo Chicken Wings", "price": 420.00}
            ],
            "subtotal": 2010.00,
            "tax": 100.50,
            "service_charge": 201.00,
            "tip": 50.00,
            "discount": 0.00,
            "total": 2361.50
        },
        {
            "filename": "bill_08_faded_thermal_ink.png",
            "title": "Heritage Corner Store",
            "subtitle": "Faded Receipt Thermal Paper",
            "order": "8011",
            "date": "2026-09-06",
            "currency": "INR",
            "style": "thermal_faded",
            "items": [
                {"qty": 1, "name": "Darjeeling Tea Tin 250g", "price": 320.00},
                {"qty": 2, "name": "Butter Shortbread Box", "price": 280.00},
                {"qty": 1, "name": "Handmade Dark Choco", "price": 190.00}
            ],
            "subtotal": 790.00,
            "tax": 39.50,
            "service_charge": 0.00,
            "tip": 0.00,
            "discount": 0.00,
            "total": 829.50
        },
        {
            "filename": "bill_09_long_supermarket.png",
            "title": "MegaMart Supercenter",
            "subtitle": "10-Item Multi-Category Receipt",
            "order": "9044",
            "date": "2026-09-06",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 1, "name": "Extra Virgin Olive Oil 1L", "price": 850.00},
                {"qty": 2, "name": "Whole Wheat Bread", "price": 100.00},
                {"qty": 1, "name": "Cheddar Cheese Block", "price": 290.00},
                {"qty": 1, "name": "Fresh Bananas 1kg", "price": 70.00},
                {"qty": 2, "name": "Avocados Import", "price": 240.00},
                {"qty": 1, "name": "Dark Roast Coffee Beans", "price": 550.00},
                {"qty": 1, "name": "Rolled Oats 1kg", "price": 180.00},
                {"qty": 2, "name": "Sparkling Water 1.5L", "price": 160.00},
                {"qty": 1, "name": "Dark Chocolate 85%", "price": 220.00},
                {"qty": 1, "name": "Dishwashing Liquid", "price": 140.00}
            ],
            "subtotal": 2800.00,
            "tax": 140.00,
            "service_charge": 0.00,
            "tip": 0.00,
            "discount": 200.00,
            "total": 2740.00
        },
        {
            "filename": "bill_10_hotel_room_service_eur.png",
            "title": "Grand Plaza Hotel & Suites",
            "subtitle": "Room Service - Euro Currency",
            "order": "10022",
            "date": "2026-09-07",
            "currency": "EUR",
            "style": "standard",
            "items": [
                {"qty": 1, "name": "Club Sandwich Supreme", "price": 22.00},
                {"qty": 1, "name": "French Onion Soup", "price": 14.00},
                {"qty": 2, "name": "Espresso Single", "price": 8.00},
                {"qty": 1, "name": "Evian Still 750ml", "price": 6.50}
            ],
            "subtotal": 50.50,
            "tax": 5.05,
            "service_charge": 7.50,
            "tip": 5.00,
            "discount": 0.00,
            "total": 68.05
        },
        {
            "filename": "bill_11_breakfast_diner.png",
            "title": "Sunny Side Diner",
            "subtitle": "Morning Breakfast Split",
            "order": "11054",
            "date": "2026-09-07",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 2, "name": "Full English Breakfast", "price": 760.00},
                {"qty": 2, "name": "Pancake Stack Maple", "price": 520.00},
                {"qty": 2, "name": "Fresh Orange Juice", "price": 300.00},
                {"qty": 2, "name": "Flat White Coffee", "price": 360.00}
            ],
            "subtotal": 1940.00,
            "tax": 97.00,
            "service_charge": 97.00,
            "tip": 50.00,
            "discount": 100.00,
            "total": 2084.00
        },
        {
            "filename": "bill_12_comped_zero_subtotal.png",
            "title": "VIP Club Lounge",
            "subtitle": "100% Comped Promo Voucher",
            "order": "12000",
            "date": "2026-09-07",
            "currency": "INR",
            "style": "standard",
            "items": [
                {"qty": 1, "name": "Complimentary Mocktail", "price": 0.00},
                {"qty": 1, "name": "Welcome Chef Appetizer", "price": 0.00}
            ],
            "subtotal": 0.00,
            "tax": 0.00,
            "service_charge": 0.00,
            "tip": 0.00,
            "discount": 0.00,
            "total": 0.00
        }
    ]

    for tc in test_cases:
        filepath = os.path.join(output_dir, tc["filename"])
        create_receipt_image(
            title=tc["title"],
            subtitle=tc["subtitle"],
            order_num=tc["order"],
            date_str=tc["date"],
            items=tc["items"],
            subtotal=tc["subtotal"],
            tax=tc["tax"],
            service_charge=tc["service_charge"],
            tip=tc["tip"],
            discount=tc["discount"],
            total=tc["total"],
            currency=tc["currency"],
            output_path=filepath,
            style=tc["style"]
        )

    print(f"Successfully generated all 12 test bills in {output_dir}")


if __name__ == "__main__":
    generate_12_test_bills()

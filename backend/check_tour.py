import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from src import create_app
from src.models.tour import Tour

app = create_app()
with app.app_context():
    tour = Tour.query.get(7)
    if tour:
        # Avoid unicode issues in console
        print("Tour ID 7 exists")
        print(f"Status: {tour.status}")
    else:
        print("Tour not found with ID 7")

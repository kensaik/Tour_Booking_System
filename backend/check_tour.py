import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from src import create_app
from src.models.tour import Tour
from src.constants import TourStatus

app = create_app()
with app.app_context():
    tour = Tour.query.get(7)
    if tour:
        # Avoid unicode issues in console
        print(f"Tour ID 7 exists")
        print(f"Status: {tour.status}")
    else:
        print("Tour not found with ID 7")

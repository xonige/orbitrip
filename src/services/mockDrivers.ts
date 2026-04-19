import { Driver } from '../types';

export const MOCK_DRIVERS: Driver[] = [
    {
        "id": "drv-myauto-120694917",
        "name": "Avtho",
        "email": "drv-myauto-120694917@orbitrip.ge",
        "phoneNumber": "+995591966217",
        "city": "kutaisi",
        "photoUrl": "https://ui-avatars.com/api/?name=Avtho&background=random&bold=true",
        "carModel": "Honda FIT (2015) Hybrid",
        "carPhotoUrl": "/cars/car__120694917_1_jpg_v_1.webp",
        "carPhotos": [
            "/cars/car_gal__120694917_2_jpg_v_1.webp",
            "/cars/car_gal__120694917_3_jpg_v_1.webp"
        ],
        "vehicleType": "Sedan",
        "status": "ACTIVE",
        "rating": 5,
        "reviewCount": 51,
        "pricePerKm": 0.69,
        "basePrice": 45,
        "maxPassengers": 4,
        "languages": ["EN", "GE", "RU"],
        "features": ["AC", "Hybrid", "Economy"],
        "blockedDates": [],
        "reviews": [
            {
                "author": "Anna",
                "date": "01 April 2026",
                "rating": 5,
                "textEn": "Safe driving and very professional. Highly recommended!",
                "textRu": "Безопасное вождение и высокий профессионализм. Рекомендую!"
            }
        ],
        "dailySalary": 150,
        "expensePer100km": 30,
        "fuelType": "Petrol"
    },
    {
        "id": "drv-mercedes-123",
        "name": "Giorgi",
        "email": "giorgi@orbitrip.ge",
        "phoneNumber": "+995599000000",
        "city": "tbilisi",
        "photoUrl": "https://ui-avatars.com/api/?name=Giorgi&background=random&bold=true",
        "carModel": "Mercedes-Benz Sprinter (2018)",
        "carPhotoUrl": "/cars/sprinter_1.webp",
        "carPhotos": [],
        "vehicleType": "Minivan",
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 120,
        "pricePerKm": 1.2,
        "basePrice": 80,
        "maxPassengers": 8,
        "languages": ["EN", "GE", "RU"],
        "features": ["AC", "Leather Seats", "Large Trunk"],
        "blockedDates": [],
        "reviews": [],
        "dailySalary": 250,
        "expensePer100km": 45,
        "fuelType": "Diesel"
    }
];

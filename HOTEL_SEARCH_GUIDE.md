# Hotel Search API Guide

## Overview

The hotel search endpoint now supports comprehensive filtering including location search, date-based availability, and guest capacity filtering.

## Endpoint

```
GET /api/v1/hotel
```

## Query Parameters

### Location & Basic Filters

| Parameter  | Type   | Description                           | Example                       |
| ---------- | ------ | ------------------------------------- | ----------------------------- |
| `location` | string | Searches hotel name, city, or address | `Hotel Riu Cancun` or `Paris` |
| `city`     | string | Filter by specific city               | `New York`                    |
| `country`  | string | Filter by country code                | `US`                          |
| `search`   | string | Search by hotel name only             | `Grand Plaza`                 |

### Date & Availability

| Parameter  | Type       | Required   | Description                   | Example      |
| ---------- | ---------- | ---------- | ----------------------------- | ------------ |
| `checkIn`  | date (ISO) | Optional\* | Check-in date                 | `2024-02-06` |
| `checkOut` | date (ISO) | Optional\* | Check-out date                | `2024-02-08` |
| `adults`   | number     | No         | Number of adults (1-10)       | `2`          |
| `rooms`    | number     | No         | Number of rooms needed (1-10) | `1`          |

\*Both `checkIn` and `checkOut` must be provided together for availability filtering

### Pricing & Sorting

| Parameter          | Type   | Description             | Example                                |
| ------------------ | ------ | ----------------------- | -------------------------------------- |
| `minRate`          | number | Minimum price per night | `100`                                  |
| `maxRate`          | number | Maximum price per night | `500`                                  |
| `propertyCategory` | string | Filter by category      | `Luxury`                               |
| `sort`             | string | Sort results            | `rating`, `-rating`, `price`, `-price` |

### Pagination

| Parameter | Type   | Default | Description                |
| --------- | ------ | ------- | -------------------------- |
| `page`    | number | 1       | Page number                |
| `limit`   | number | 10      | Results per page (max 100) |

## Example Requests

### 1. Basic Location Search

```
GET /api/v1/hotel?location=Hotel Riu Cancun
```

Searches for hotels matching "Hotel Riu Cancun" in name, city, or address.

### 2. Search with Dates (Your URL Pattern)

```
GET /api/v1/hotel?location=Hotel+Riu+Cancun+-+Adults+Only&checkIn=2024-02-06&checkOut=2024-02-08&adults=2&rooms=1
```

Returns hotels that:

- Match the location search
- Have at least 1 available room for Feb 6-8, 2024
- Have rooms that can accommodate 2+ adults

### 3. City Search with Dates

```
GET /api/v1/hotel?city=Paris&checkIn=2024-03-15&checkOut=2024-03-20&adults=4&rooms=2
```

Returns hotels in Paris with 2+ available rooms for 4 adults.

### 4. Price Range Filter

```
GET /api/v1/hotel?location=New York&minRate=100&maxRate=300&sort=-rating
```

Hotels in New York, $100-$300/night, sorted by highest rating.

### 5. Availability Only

```
GET /api/v1/hotel?checkIn=2024-12-25&checkOut=2024-12-28
```

All hotels with available rooms for those dates.

## Response Format

```json
{
  "status": "success",
  "data": {
    "hotels": [
      {
        "_id": "...",
        "name": "Grand Plaza Hotel",
        "location": {
          "city": "New York",
          "address": "123 Main St",
          "latitude": 40.7128,
          "longitude": -74.006
        },
        "hotelRating": 4.5,
        "lowRate": 150,
        "highRate": 500,
        // When checkIn/checkOut are provided:
        "availableRooms": 5,
        "lowestAvailableRate": 180
      }
    ],
    "page": 1,
    "totalPages": 3,
    "totalHotels": 25
  }
}
```

## Additional Response Fields (When Dates Provided)

When `checkIn` and `checkOut` are provided, each hotel includes:

- **`availableRooms`**: Number of rooms available for the dates
- **`lowestAvailableRate`**: Cheapest available room rate

## How It Works

### Without Dates

Returns all hotels matching the filters (location, city, price, etc.)

### With Dates

1. Finds hotels matching basic filters
2. Checks room availability for each hotel
3. Excludes rooms with overlapping bookings
4. Filters hotels with insufficient available rooms
5. Adds availability info to response

### Capacity Filtering

- **`adults`**: Only shows hotels with rooms that can accommodate the number of adults
- **`rooms`**: Only shows hotels with at least this many available rooms

## Frontend Implementation

### React/JavaScript Example

```javascript
const searchHotels = async (searchParams) => {
  const params = new URLSearchParams({
    location: searchParams.location,
    checkIn: searchParams.checkIn, // Format: YYYY-MM-DD
    checkOut: searchParams.checkOut,
    adults: searchParams.adults,
    rooms: searchParams.rooms,
    page: searchParams.page || 1,
    limit: searchParams.limit || 10,
  });

  const response = await fetch(`/api/v1/hotel?${params}`);
  return response.json();
};

// Usage from your URL
const urlParams = new URLSearchParams(window.location.search);
const results = await searchHotels({
  location: urlParams.get("location"),
  checkIn: urlParams.get("checkIn"),
  checkOut: urlParams.get("checkOut"),
  adults: urlParams.get("adults"),
  rooms: urlParams.get("rooms"),
});
```

### Parsing Your URL Format

Your URL: `http://localhost:5173/search?location=Hotel+Riu+Cancun+-+Adults+Only&checkIn=2024-02-06&checkOut=2024-02-08&adults=2&rooms=1`

Backend API call:

```javascript
const apiUrl = `http://localhost:3000/api/v1/hotel?${new URLSearchParams({
  location: "Hotel Riu Cancun - Adults Only",
  checkIn: "2024-02-06",
  checkOut: "2024-02-08",
  adults: "2",
  rooms: "1",
})}`;
```

## Important Notes

1. **Date Format**: Use ISO format `YYYY-MM-DD` for dates
2. **Both Dates Required**: `checkIn` and `checkOut` must both be provided for availability filtering
3. **Performance**: Availability checking queries multiple collections, so use pagination
4. **Booking Status**: Only considers bookings with status "pending" or "confirmed"
5. **Room Status**: Only checks rooms with status "available"

## Testing with Postman

Update your Postman collection with this request:

```json
{
  "name": "Search Hotels with Availability",
  "request": {
    "method": "GET",
    "url": {
      "raw": "{{baseUrl}}/hotel?location=Hotel Riu&checkIn=2024-02-06&checkOut=2024-02-08&adults=2&rooms=1",
      "host": ["{{baseUrl}}"],
      "path": ["hotel"],
      "query": [
        { "key": "location", "value": "Hotel Riu" },
        { "key": "checkIn", "value": "2024-02-06" },
        { "key": "checkOut", "value": "2024-02-08" },
        { "key": "adults", "value": "2" },
        { "key": "rooms", "value": "1" }
      ]
    }
  }
}
```

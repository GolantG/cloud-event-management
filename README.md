# Event Management System

## Temat projektu
- System zarządzania wydarzeniami z interfejsem webowym i bazą danych. Aplikacja umożliwia tworzenie, edytowanie, usuwanie wydarzeń oraz rejestrację uczestników.

## Autor projektu
- Anton Halavach, 52299

## Uruchomienie projektu
# 1. Sklonuj repozytorium
- git clone https://github.com/GolantG/cloud-event-management.git
- cd cloud-event-management

# 2. Zainstaluj zależnoście
- cd backend
- npm install

# 3. Uruchom aplikację
- docker-compose up --build

# 4. Otwórz przeglądarkę i przejdź do:
#  - Interfejs użytkownika: otwórz plik frontend/index.html
#  - API backendu: http://localhost:3001/api

## Kontenery Docker
#  event-db (Baza danych)
- Obraz: MySQL 8.0
- Port: 3307:3306
- Baza danych: eventdb
- Użytkownik: user, Hasło: password123

# event-backend (API)
- Obraz: Node.js 18
- Port: 3001:3001
- API: http://localhost:3001/api

## Funkcjonalności
# Zarządzanie wydarzeniami
- Tworzenie nowych wydarzeń
- Przeglądanie listy wydarzeń
- Edycja istniejących wydarzeń
- Usuwanie wydarzeń

# Zarządzanie uczestnikami
- Rejestracja uczestników na wydarzenia
- Przeglądanie listy uczestników
- Sprawdzanie dostępności miejsc

# Rejestracja na wydarzenia
- Formularz rejestracyjny
- Walidacja danych
- Sprawdzanie limitów uczestników

# Interfejs webowy
- Strona główna ze statystykami
- Lista wszystkich wydarzeń
- Szczegóły wydarzenia + rejestracja
- Panel zarządzania wydarzeniami

## Endpointy API
# Wydarzenia
- GET /api/events - Pobierz wszystkie wydarzenia
- GET /api/events/:id - Pobierz wydarzenie po ID
- POST /api/events - Utwórz nowe wydarzenie
- PUT /api/events/:id - Zaktualizuj wydarzenie
 -DELETE /api/events/:id - Usuń wydarzenie

# Uczestnicy
- GET /api/participants - Pobierz wszystkich uczestników
- POST /api/participants - Zarejestruj uczestnika

## Baza danych
# Tabele
- events - informacje o wydarzeniach
- participants - uczestnicy z przypisaniem do wydarzeń

## Technologie
# Backend: Node.js, Express.js
# Baza danych: MySQL
# Frontend: HTML, CSS, JavaScript
# Konteneryzacja: Docker, Docker Compose

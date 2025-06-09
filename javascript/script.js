// Hotel Monarch Prague - JavaScript funkcionalita

document.addEventListener('DOMContentLoaded', function() {
    
    // === NAVIGACE ===
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Zavření menu při kliknutí na odkaz
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling pro hero button
    const heroBtn = document.getElementById('heroBtn');
    heroBtn.addEventListener('click', function() {
        document.getElementById('rooms').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // === KARUSEL POKOJŮ ===
    const roomsContainer = document.querySelector('.rooms-container');
    const roomCards = document.querySelectorAll('.room-card');
    const prevBtn = document.getElementById('roomsPrev');
    const nextBtn = document.getElementById('roomsNext');
    
    let currentRoomIndex = Math.floor(roomCards.length / 2); // Start with the middle card
    const totalRooms = roomCards.length;

    function updateCarouselPosition() {
        roomCards.forEach((card, index) => {
            const offset = index - currentRoomIndex;
            card.style.transform = `translateX(${offset * 110}%) scale(${index === currentRoomIndex ? 1 : 0.9})`;
            card.style.opacity = index === currentRoomIndex ? '1' : '0.65';
            card.classList.toggle('active', index === currentRoomIndex);
        });
    }

    // Ensure buttons call the correct functions
    nextBtn.addEventListener('click', () => {
        currentRoomIndex = (currentRoomIndex + 1) % totalRooms;
        updateCarouselPosition();
    });

    prevBtn.addEventListener('click', () => {
        currentRoomIndex = (currentRoomIndex - 1 + totalRooms) % totalRooms;
        updateCarouselPosition();
    });

    // Initialize the carousel
    updateCarouselPosition();

    // Remove automatic switching to allow manual control
    // setInterval(nextRoom, 5000);

    // === MODÁLNÍ OKNO PRO DETAIL POKOJE ===
    const modal = document.getElementById('room-modal');
    const closeModal = document.querySelector('.close');
    const roomDetailsButtons = document.querySelectorAll('.room-details-btn');
    
    // Data pokojů s fotografiami
    const roomsData = {
        standard: {
            title: 'Standard Room',
            price: '2.000 Kč / noc',
            description: 'Komfortní pokoj s moderním vybavením a výhledem na město. Obsahuje manželskou postel, klimatizaci, minibar, TV s plochou obrazovkou a vlastní koupelnu s vanou.',
            images: [
                'images/standard-bed.jpg',
                'images/standard-bathroom.jpg',
                'images/standard-view.jpg',
                'images/standard-detail.jpg'
            ]
        },
        luxury: {
            title: 'Luxury Suite',
            price: '4.500 Kč / noc',
            description: 'Prostorný apartmán s odděleným obývacím pokojem a balkonem s výhledem na Pražský hrad. Zahrnuje luxusní vybavení, jacuzzi, minibar a další prémiové služby.',
            images: [
                'images/luxury-living.jpg',
                'images/luxury-bedroom.jpg',
                'images/luxury-bathroom.jpg',
                'images/luxury-balcony.jpg'
            ]
        },
        penthouse: {
            title: 'Exclusive Penthouse',
            price: '8.000 Kč / noc',
            description: 'Luxusní penthouse s panoramatickým výhledem na celou Prahu. Obsahuje dvě ložnice, kuchyň, obývací pokoj, terasu a všechny možné luxusní vymoženosti.',
            images: [
                'images/penthouse-living.jpg',
                'images/penthouse-bedroom.jpg',
                'images/penthouse-kitchen.jpg',
                'images/penthouse-terrace.jpg'
            ]
        }
    };

    let currentGalleryIndex = 0;
    let currentRoomData = null;

    // Otevření modálního okna
    roomDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const roomType = this.getAttribute('data-room');
            currentRoomData = roomsData[roomType];
            currentGalleryIndex = 0;
            
            showRoomModal(currentRoomData);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Zavření modálního okna
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Zavření při kliknutí mimo obsah
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    function showRoomModal(roomData) {
        document.getElementById('modal-room-title').textContent = roomData.title;
        document.getElementById('modal-room-price').textContent = roomData.price;
        document.getElementById('modal-room-description').textContent = roomData.description;
        
        // Nastavení galerie
        updateGallery();
        createIndicators(roomData.images.length);
    }

    function updateGallery() {
        if (currentRoomData) {
            const mainImage = document.getElementById('gallery-main-image');
            mainImage.src = currentRoomData.images[currentGalleryIndex];
            mainImage.alt = currentRoomData.title;
            
            // Aktualizace indikátorů
            updateIndicators();
        }
    }

    function createIndicators(count) {
        const indicatorsContainer = document.getElementById('gallery-indicators');
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => {
                currentGalleryIndex = i;
                updateGallery();
            });
            indicatorsContainer.appendChild(indicator);
        }
    }

    function updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentGalleryIndex);
        });
    }

    // Navigace v galerii
    document.getElementById('galleryPrev').addEventListener('click', function() {
        if (currentRoomData) {
            currentGalleryIndex = (currentGalleryIndex - 1 + currentRoomData.images.length) % currentRoomData.images.length;
            updateGallery();
        }
    });

    document.getElementById('galleryNext').addEventListener('click', function() {
        if (currentRoomData) {
            currentGalleryIndex = (currentGalleryIndex + 1) % currentRoomData.images.length;
            updateGallery();
        }
    });

    // === REZERVAČNÍ FORMULÁŘ ===
    const reservationForm = document.getElementById('reservation-form');
    const totalPriceElement = document.getElementById('total-price');
    const formMessage = document.getElementById('form-message');
    
    // Ceny pokojů
    const roomPrices = {
        standard: 2000,
        luxury: 4500,
        penthouse: 8000
    };

    // Pole formuláře pro výpočet ceny
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const guestsInput = document.getElementById('guests');
    const roomTypeInput = document.getElementById('roomType');

    // Nastavení minimálního data na dnes
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkoutInput.min = today;

    // Event listenery pro aktualizaci ceny
    [checkinInput, checkoutInput, guestsInput, roomTypeInput].forEach(input => {
        input.addEventListener('change', calculatePrice);
    });

    // Validace dat
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const tomorrow = new Date(checkinDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        checkoutInput.min = tomorrow.toISOString().split('T')[0];
        
        // Pokud je checkout dříve než checkin + 1 den, vynuluj checkout
        if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
            checkoutInput.value = '';
        }
        calculatePrice();
    });

    function calculatePrice() {
        const checkin = checkinInput.value;
        const checkout = checkoutInput.value;
        const guests = parseInt(guestsInput.value) || 2;
        const roomType = roomTypeInput.value;

        if (!checkin || !checkout) {
            totalPriceElement.textContent = '0 Kč';
            return;
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            totalPriceElement.textContent = '0 Kč';
            return;
        }

        let totalPrice = roomPrices[roomType] * nights;
        
        // Poplatek za extra osoby (více než 2)
        if (guests > 2) {
            const extraGuests = guests - 2;
            totalPrice += extraGuests * 500 * nights;
        }

        totalPriceElement.textContent = totalPrice.toLocaleString('cs-CZ') + ' Kč';
    }

    // Odeslání formuláře
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validace na straně klienta
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!firstName || !lastName || !email) {
            showMessage('Prosím vyplňte všechna povinná pole.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Prosím zadejte platnou emailovou adresu.', 'error');
            return;
        }

        if (!checkinInput.value || !checkoutInput.value) {
            showMessage('Prosím vyberte datum příjezdu a odjezdu.', 'error');
            return;
        }

        // Odeslání dat pomocí Fetch API
        const formData = new FormData(this);
        formData.append('totalPrice', totalPriceElement.textContent);

        fetch('php/reservation.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Rezervace byla úspěšně odeslána! Brzy vás budeme kontaktovat.', 'success');
                reservationForm.reset();
                totalPriceElement.textContent = '0 Kč';
            } else {
                showMessage('Chyba při odesílání rezervace. Zkuste to prosím znovu.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Chyba při odesílání rezervace. Zkuste to prosím znovu.', 'error');
        });
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // === FAQ ACCORDION ===
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Zavřít ostatní otevřené items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle aktuální item
            item.classList.toggle('active');
        });
    });

    // === LAZY LOADING A ANIMACE ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Sledování elementů pro animace
    const animatedElements = document.querySelectorAll('.room-card, .review-card, .faq-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // === STICKY NAVIGATION ===
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    });

    // Inicializace ceny při načtení
    calculatePrice();
});

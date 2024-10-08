$(document).ready(function () {
    // Функция для проверки состояния аутентификации
    function checkAuthState() {
        const authButtonsContainer = document.getElementById("auth-buttons");
        authButtonsContainer.innerHTML = "";  // Очистка контейнера кнопок
        console.log("Проверка аутентификации");
        const token = localStorage.getItem("jwtToken");  // Получение токена из локального хранилища
        const navMenu = document.querySelector('.nav');
        document.cookie = 'jwtToken=' + localStorage['jwtToken'];

        if (token) {
            authButtonsContainer.innerHTML = `
                <button type="button" class="btn btn-outline-primary ml-2" onclick="redirectToProfile()">Profile</button>
                <button type="button" class="btn btn-danger ml-2" onclick="logout()">Logout</button>
            `;

            // Добавляем пункт "Моё" в меню, если пользователь аутентифицирован
            const myMenuItem = document.createElement('li');
            myMenuItem.innerHTML = `<a href="/api/v1/user/my" class="nav-link px-2">Моё</a>`;
            navMenu.appendChild(myMenuItem);  // Добавляем элемент в конец списка меню

            // Пример запроса для проверки аутентификации
            $.ajax({
                url: "/api/v1/user/hello",
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {
                    $('#greeting-text').html(getGreeting() + response.username);
                },
                error: function (error) {
                    console.error("Ошибка при получении данных пользователя: " + error.responseJSON.message);
                }
            });
        } else {
            authButtonsContainer.innerHTML = `
                <button type="button" class="btn btn-outline-primary ml-2" data-toggle="modal" data-target="#loginModal">Login</button>
                <button type="button" class="btn btn-primary ml-2" data-toggle="modal" data-target="#registerModal">Sign Up</button>
            `;
            $('#greeting-text').html(getGreeting());
        }
    }

    // Функция для входа пользователя
    window.handleLogin = function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // AJAX-запрос для аутентификации пользователя
        $.ajax({
            url: '/api/v1/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),  // Передача данных в формате JSON
            success: function(response) {
                localStorage.setItem('jwtToken', response.token);
                window.location.href = '/api/v1/main';  // Перенаправление на главную страницу
            },
            error: function(error) {
                alert('Ошибка входа: ' + error.responseJSON.message);  // Сообщение об ошибке
            }
        });
    };

    // Функция выхода пользователя
    window.logout = function () {
        const token = localStorage.getItem("jwtToken");
        $.ajax({
            url: "/api/v1/auth/logout",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + token  // Добавление токена в заголовок запроса
            },
            success: function (response) {
                localStorage.removeItem("jwtToken");  // Удаление токена из локального хранилища
                window.location.href = "/api/v1/main";  // Перенаправление на главную страницу
            },
            error: function (error) {
                alert("Ошибка при выходе: " + error.responseJSON.message);  // Сообщение об ошибке
            }
        });
    };

    // Функция для перенаправления на страницу профиля
    window.redirectToProfile = function () {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            $.ajax({
                url: "/api/v1/user",
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function(response) {
                    window.location.href = "/api/v1/user";  // Перенаправление на страницу профиля
                },
                error: function(error) {
                    alert("Ошибка аутентификации. Пожалуйста, войдите заново.");
                    window.location.href = "/api/v1/main";  // Перенаправление на страницу входа при ошибке
                }
            });
        } else {
            alert("Пожалуйста, войдите в систему.");
            window.location.href = "/api/v1/main";  // Перенаправление на страницу входа, если токена нет
        }
    };

    // Функция для загрузки популярных продуктов через API
    function loadPopularProducts() {
        $.ajax({
            url: '/api/v1/main/get-popular-products',
            type: 'GET',
            success: function(response) {
                const owlCarousel = $('.owl-carousel');
                owlCarousel.trigger('remove.owl.carousel');  // Очистка текущих слайдов

                if (Array.isArray(response) && response.length > 0) {
                    response.forEach(function(product) {
                        const imageUrl = product.imageUrl || 'https://via.placeholder.com/150';
                        const productName = product.name || 'Без названия';
                        const productPrice = product.price ? `${product.price} ₽` : 'Нет цены';
                        const productOldPrice = product.oldPrice ? `<span class="product-old-price">${product.oldPrice} ₽</span>` : '';

                        const productHtml = `
                            <div class="item">
                                <a href="/api/v1/product/${product.id}" class="product-card-link">
                                    <div class="product-card text-center">
                                        <img src="${imageUrl}" alt="${productName}">
                                        <h5 class="product-name">${productName}</h5>
                                        <p class="product-price">${productPrice} ${productOldPrice}</p>
                                    </div>
                                </a>
                            </div>`;
                        owlCarousel.trigger('add.owl.carousel', [$(productHtml)]);  // Корректная вставка нового слайда
                    });
                    owlCarousel.trigger('refresh.owl.carousel');  // Обновление карусели после добавления продуктов
                } else {
                    console.error("Нет популярных продуктов для отображения.");
                }
            },
            error: function(error) {
                console.error("Ошибка при загрузке популярных продуктов:", error.responseJSON.message);
            }
        });
    }

    // Вызов функции проверки состояния аутентификации при загрузке страницы
    checkAuthState();

    // Вызов функции загрузки популярных продуктов при загрузке страницы
    loadPopularProducts();

    // Инициализация слайдера
    var owl = $(".owl-carousel").owlCarousel({
        loop: true,
        margin: 10,
        nav: false,
        dots: false,
        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 6 }  // 6 айтемов на экране при большом разрешении
        }
    });

    // Привязываем внешние кнопки к слайдеру
    $(".slider-btn-prev").click(function () {
        owl.trigger('prev.owl.carousel');
    });
    $(".slider-btn-next").click(function () {
        owl.trigger('next.owl.carousel');
    });

    // Функция регистрации пользователя
    window.handleRegister = function () {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const name = document.getElementById('regName').value;

        $.ajax({
            url: '/api/v1/auth/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password, name }),  // Отправка данных в формате JSON
            success: function(response) {
                alert('Регистрация успешна!');
                $('#registerModal').modal('hide');  // Закрытие модального окна
            },
            error: function(error) {
                alert('Ошибка регистрации: ' + error.responseJSON.message);
            }
        });
    };

    // Анимация появления секций при прокрутке
    $(window).on('scroll', function () {
        $('.section').each(function () {
            if ($(window).scrollTop() > $(this).offset().top - $(window).height() / 1.2) {
                $(this).addClass('section-visible');
            }
        });
    });
});


// Функция для получения приветствия в зависимости от времени суток
function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Доброе утро";
    if (currentHour >= 12 && currentHour < 18) return "Добрый день";
    if (currentHour >= 18 && currentHour < 22) return "Добрый вечер";
    return "Доброй ночи";
}

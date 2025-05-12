document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Валидация полей
        if (!username || !password) {
            showError('Пожалуйста, заполните все поля');
            return;
        }

        // Показываем анимацию загрузки
        const submitButton = loginForm.querySelector('.login-btn');
        submitButton.textContent = 'Вход...';
        submitButton.disabled = true;

        // Отправка данных на сервер
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка авторизации');
            }
            return response.json();
        })
        .then(data => {
            // Обработка успешного входа
            handleSuccessfulLogin(data);
        })
        .catch(error => {
            // Обработка ошибок
            submitButton.textContent = 'Войти';
            submitButton.disabled = false;
            showError(error.message || 'Неверный логин или пароль');
        });
    });

    function handleSuccessfulLogin(data) {
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('username', data.username);

        // Перенаправляем пользователя
        window.location.href = data.role === 'admin' ? '/admin-panel.html' : '/dashboard.html';
    }

    function showError(message) {
        // Удаляем предыдущие сообщения об ошибках
        const existingError = loginForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        //элемент с ошибкой
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = '#e74c3c';
        errorElement.style.marginBottom = '15px';
        errorElement.style.textAlign = 'center';
        errorElement.style.fontSize = '14px';
        errorElement.textContent = message;

        // Вставляем сообщение перед кнопкой входа
        const loginButton = loginForm.querySelector('.login-btn');
        loginForm.insertBefore(errorElement, loginButton);
    }

    // Обработчик для ссылки "Забыли пароль?"
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        const email = prompt('Введите ваш email для восстановления пароля:');
        
        if (email) {
            fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при запросе сброса пароля');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Инструкции по сбросу пароля отправлены на ваш email');
            })
            .catch(error => {
                alert(error.message || 'Произошла ошибка при восстановлении пароля');
            });
        }
    });
});

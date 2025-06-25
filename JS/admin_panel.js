document.addEventListener('DOMContentLoaded', function() {
    // Базовый URL API - замените на реальный URL
    const API_BASE_URL = 'http://ваш-сервер.com/api';
    let authToken = localStorage.getItem('authToken');

    // Проверка аутентификации с перенаправлением
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    // Получаем элементы DOM с проверкой
    const elements = {
        tableBody: document.querySelector('.users-table tbody'),
        searchInput: document.querySelector('.search-box input'),
        addUserBtn: document.querySelector('.btn-add-user'),
        logoutBtn: document.querySelector('.logout-button')
    };

    // Проверка наличия обязательных элементов
    if (!elements.tableBody || !elements.logoutBtn) {
        console.error('Не найдены обязательные элементы DOM');
        return;
    }

    
    async function makeRequest(url, method = 'GET', body = null) {
        try {
            const headers = {
                'Authorization': `Bearer ${authToken}`
            };
            
            if (body) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE_URL}${url}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка запроса ${method} ${url}:`, error);
            throw error;
        }
    }

    // Загрузка пользователей с сервера
    async function loadUsers() {
        try {
            return await makeRequest('/users');
        } catch (error) {
            showNotification('Не удалось загрузить пользователей', 'error');
            return [];
        }
    }

    // Отображение пользователей в таблице
    async function renderUsers(usersToRender = null) {
        try {
            const users = usersToRender || await loadUsers();
            elements.tableBody.innerHTML = '';
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td><span class="role ${user.role}">${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</span></td>
                    <td class="actions">
                        <button class="btn-edit" data-id="${user.id}">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        <button class="btn-delete" data-id="${user.id}">
                            <i class="fas fa-trash-alt"></i> Удалить
                        </button>
                    </td>
                `;
                elements.tableBody.appendChild(row);
            });
            
            addEditEventListeners();
            addDeleteEventListeners();
        } catch (error) {
            console.error('Ошибка рендеринга:', error);
        }
    }

    // Поиск пользователей
    elements.searchInput?.addEventListener('input', async function(e) {
        const searchTerm = e.target.value.toLowerCase();
        try {
            const allUsers = await loadUsers();
            const filteredUsers = allUsers.filter(user => 
                (user.name?.toLowerCase().includes(searchTerm)) || 
                (user.email?.toLowerCase().includes(searchTerm)) ||
                (user.login?.toLowerCase().includes(searchTerm))
            );
            renderUsers(filteredUsers);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    });

    // Добавление нового пользователя
    elements.addUserBtn?.addEventListener('click', () => showUserModal());

    // Модальное окно для пользователя
    async function showUserModal(user = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${user ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
                <form id="user-form">
                    <div class="form-group">
                        <label for="user-name">ФИО</label>
                        <input type="text" id="user-name" value="${user?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="user-login">Логин</label>
                        <input type="text" id="user-login" value="${user?.login || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="user-email">Email</label>
                        <input type="email" id="user-email" value="${user?.email || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="user-role">Роль</label>
                        <select id="user-role">
                            <option value="user" ${user?.role === 'user' ? 'selected' : ''}>Пользователь</option>
                            <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="user-password">${user ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}</label>
                        <input type="password" id="user-password" ${user ? '' : 'required'}>
                    </div>
                    <button type="submit" class="modal-submit-btn">${user ? 'Сохранить' : 'Добавить'}</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Закрытие модального окна
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Обработка отправки формы
        modal.querySelector('#user-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('user-name').value,
                login: document.getElementById('user-login').value,
                email: document.getElementById('user-email').value,
                role: document.getElementById('user-role').value,
                password: document.getElementById('user-password').value
            };
            
            try {
                if (user) {
                    await makeRequest(`/users/${user.id}`, 'PUT', userData);
                    showNotification('Пользователь обновлен');
                } else {
                    await makeRequest('/users', 'POST', userData);
                    showNotification('Пользователь добавлен');
                }
                
                renderUsers();
                modal.remove();
            } catch (error) {
                showNotification(error.message || 'Ошибка сохранения', 'error');
            }
        });
    }

    // Обработчики кнопок
    function addEditEventListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = this.getAttribute('data-id');
                try {
                    const user = await makeRequest(`/users/${userId}`);
                    showUserModal(user);
                } catch (error) {
                    showNotification('Не удалось загрузить данные пользователя', 'error');
                }
            });
        });
    }

    function addDeleteEventListeners() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = this.getAttribute('data-id');
                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                    try {
                        await makeRequest(`/users/${userId}`, 'DELETE');
                        showNotification('Пользователь удален');
                        renderUsers();
                    } catch (error) {
                        showNotification('Не удалось удалить пользователя', 'error');
                    }
                }
            });
        });
    }

    // Выход из системы
    elements.logoutBtn.addEventListener('click', async function() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            try {
                await makeRequest('/auth/logout', 'POST');
            } catch (error) {
                console.error('Ошибка выхода:', error);
            } finally {
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            }
        }
    });

    // Функция показа уведомлений
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Инициализация приложения
    renderUsers();
});

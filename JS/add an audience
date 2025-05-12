document.addEventListener('DOMContentLoaded', function() {
    //  URL API
    const API_BASE_URL = 'http://сервер.com/api';
    let authToken = localStorage.getItem('authToken');

    // Проверка аутентификации
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    // элементы DOM
    const elements = {
        tableBody: document.querySelector('.auditories-table tbody'),
        searchInput: document.querySelector('.search-box input'),
        addButton: document.querySelector('.add-auditory-button'),
        logoutBtn: document.querySelector('.logout-button'),
        refreshBtn: document.querySelector('.refresh-button')
    };

    
    async function makeRequest(endpoint, method = 'GET', body = null) {
        try {
            const headers = {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сервера');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка запроса:', error);
            showNotification(error.message || 'Ошибка соединения', 'error');
            throw error;
        }
    }

    // Загрузка аудиторий с сервера
    async function loadAuditories() {
        try {
            return await makeRequest('/auditories');
        } catch (error) {
            return [];
        }
    }

    // Отображение аудиторий в таблице
    async function renderAuditories(auditoriesToRender = null) {
        try {
            const auditories = auditoriesToRender || await loadAuditories();
            elements.tableBody.innerHTML = '';
            
            auditories.forEach(auditory => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${auditory.name}</td>
                    <td>${auditory.currentStudents}/${auditory.capacity}</td>
                    <td>${auditory.lastUpdate || 'Нет данных'}</td>
                    <td class="actions">
                        <button class="btn-edit" data-id="${auditory.id}">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        <button class="btn-delete" data-id="${auditory.id}">
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

    // Поиск аудиторий
    elements.searchInput.addEventListener('input', async function(e) {
        const searchTerm = e.target.value.toLowerCase();
        try {
            const allAuditories = await loadAuditories();
            const filtered = allAuditories.filter(auditory => 
                auditory.name.toLowerCase().includes(searchTerm)
            );
            renderAuditories(filtered);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    });

    // Модальное окно для добавления/редактирования аудитории
    async function showAuditoryModal(auditory = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${auditory ? 'Редактировать аудиторию' : 'Добавить аудиторию'}</h2>
                <form id="auditory-form">
                    <div class="form-group">
                        <label for="auditory-name">Название</label>
                        <input type="text" id="auditory-name" value="${auditory?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="auditory-capacity">Вместимость</label>
                        <input type="number" id="auditory-capacity" value="${auditory?.capacity || ''}" required>
                    </div>
                    <button type="submit" class="modal-submit-btn">
                        ${auditory ? 'Сохранить' : 'Добавить'}
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Стили для модального окна
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 25px;
                border-radius: 8px;
                width: 100%;
                max-width: 500px;
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 24px;
                cursor: pointer;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            .form-group input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .modal-submit-btn {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);

        // Закрытие модального окна
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Обработка отправки формы
        modal.querySelector('#auditory-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const auditoryData = {
                name: document.getElementById('auditory-name').value,
                capacity: parseInt(document.getElementById('auditory-capacity').value)
            };
            
            try {
                if (auditory) {
                    await makeRequest(`/auditories/${auditory.id}`, 'PUT', auditoryData);
                    showNotification('Аудитория обновлена');
                } else {
                    await makeRequest('/auditories', 'POST', auditoryData);
                    showNotification('Аудитория добавлена');
                }
                
                renderAuditories();
                modal.remove();
                style.remove();
            } catch (error) {
                console.error('Ошибка сохранения:', error);
            }
        });
    }

    // Обработчики кнопок
    function addEditEventListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async function() {
                const auditoryId = this.getAttribute('data-id');
                try {
                    const auditory = await makeRequest(`/auditories/${auditoryId}`);
                    showAuditoryModal(auditory);
                } catch (error) {
                    console.error('Ошибка загрузки:', error);
                }
            });
        });
    }

    function addDeleteEventListeners() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async function() {
                const auditoryId = this.getAttribute('data-id');
                if (confirm('Вы уверены, что хотите удалить эту аудиторию?')) {
                    try {
                        await makeRequest(`/auditories/${auditoryId}`, 'DELETE');
                        showNotification('Аудитория удалена');
                        renderAuditories();
                    } catch (error) {
                        console.error('Ошибка удаления:', error);
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

    // Обновление данных
    elements.refreshBtn.addEventListener('click', function() {
        renderAuditories();
        showNotification('Данные обновлены');
    });

    // Добавление новой аудитории
    elements.addButton.addEventListener('click', function() {
        showAuditoryModal();
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

    // Инициализация
    renderAuditories();
});

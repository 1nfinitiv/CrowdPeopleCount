document.addEventListener('DOMContentLoaded', function() {
    // заменит
    const API_BASE_URL = 'https://your-api-server.com/api';
    const authToken = localStorage.getItem('authToken');
    
    // Проверка аутентификации
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    // Получаем элементы DOM
    const elements = {
        roomSelect: document.getElementById('room'),
        dateInput: document.getElementById('date'),
        logoutButton: document.querySelector('.logout-button'),
        chartCanvas: document.getElementById('attendanceChart'),
        navLinks: document.querySelectorAll('.nav-link')
    };

    // Обработчики для навигационного меню
    elements.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
                return;
            }
            
            
            console.log(`Переход на ${this.getAttribute('href')}`);
            
        });
    });

    // Инициализация графика
    const ctx = elements.chartCanvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: getChartOptions()
    });

   
    loadInitialData();

   
    async function loadInitialData() {
        try {
            // Загружаем список аудиторий
            const rooms = await fetchRooms();
            populateRoomSelect(rooms);
            
            
            await fetchAndUpdateChart();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            showNotification('Не удалось загрузить данные', 'error');
        }
    }

    // Загрузка списка аудиторий с сервера
    async function fetchRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки аудиторий');
            
            const data = await response.json();
            return data.rooms || [];
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }

    // Заполнение выпадающего списка аудиторий
    function populateRoomSelect(rooms) {
        elements.roomSelect.innerHTML = '';
        
        if (rooms.length === 0) {
            elements.roomSelect.innerHTML = '<option value="">Нет доступных аудиторий</option>';
            return;
        }
        
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            elements.roomSelect.appendChild(option);
        });
    }

    // Загрузка данных посещаемости и обновление графика
    async function fetchAndUpdateChart() {
        const roomId = elements.roomSelect.value;
        const date = elements.dateInput.value;
        
        if (!roomId || !date) return;
        
        try {
            const attendanceData = await fetchAttendanceData(roomId, date);
            updateChart(attendanceData);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            showNotification('Не удалось загрузить статистику', 'error');
        }
    }

    // Загрузка данных посещаемости с сервера
    async function fetchAttendanceData(roomId, date) {
        try {
            const response = await fetch(`${API_BASE_URL}/attendance?roomId=${roomId}&date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки статистики');
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    // Обновление графика новыми данными
    function updateChart(data) {
        const labels = data.map(item => {
            const date = new Date(item.timestamp);
            return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        });
        
        const attendanceCounts = data.map(item => item.count);
        
        chart.data.labels = labels;
        
        if (chart.data.datasets.length === 0) {
            chart.data.datasets.push({
                label: 'Количество людей',
                data: attendanceCounts,
                backgroundColor: 'rgba(30, 136, 229, 0.2)',
                borderColor: 'rgba(30, 136, 229, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            });
        } else {
            chart.data.datasets[0].data = attendanceCounts;
        }
        
        chart.update();
    }

    // Выход из системы
    async function logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
            } catch (error) {
                console.error('Ошибка выхода:', error);
            } finally {
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            }
        }
    }

    // Настройки графика
    function getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Количество людей'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Время'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        };
    }

    // Показать уведомление
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
                z-index: 1000;
            }
            .notification.success {
                background-color: #4CAF50;
            }
            .notification.error {
                background-color: #F44336;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }

    
    elements.logoutButton.addEventListener('click', logout);
});

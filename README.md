# API для записи на онлайн-консультацию к юристу с заблаговременным напоминанием.

## Установка, сборка и запуск

    npm install
    npm run build
    npm start

Для полноценного запуска API необходимо создать и заполнить .env файл в корне проекта, взяв за образец .env.example.

### Тестовый режим

Для удобства, чтобы не поднимать сервер MongoDB и не настраивать переменные, можно запустить приложение с тегом "test".

    npm start:test
    
В этом случае будет использован [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server), вместо подключения к реальной базе данных.

### Docker образ
Есть возможность запустить Api c docker образа

контейнер запускается в тестовом режиме, то есть с использованием mongodb-memory-server

скачать

    docker pull ghcr.io/anboch/legal-advice-api:test-mode

запустить

    docker run -d -p 5000:5000  ghcr.io/anboch/legal-advice-api:test-mode

## REST API
По умолчанию сервер запускается по адресу 

    localhost:5000

## Подготовка базы данных

Для добавления в базу данных четырех пользователей (2 юристов и 2 клиентов). Необходимо сделать запрос на

    GET /user/seed

тело ответа будет содержать информацию для последующей авторизации. 
### - Регистрация (в случае подготовки базы данных - не обязательна)
    POST /user/register

Тело запроса должно содержать:

    fullName: string;
	role: 'client' | 'lawyer'
	phoneNumber: string;
	password: string;
	lawArea: string[];

### - Авторизация
    POST /user/login

Тело запроса должно содержать:

	phoneNumber: string;
	password: string;

При успешном входе, в теле ответа будет находиться JWT токен.
### - Запись клиента на консультацию 
Пользователь должен быть авторизован (необходимо в заголовок запроса 'Authorization' добавить значение 'Bearer ' + JWT токен полученный при авторизации)


    POST /meeting/sign-up

Тело запроса должно содержать:

	clientPhoneNumber: string;
	lawyerPhoneNumber: string;
    time: number;

time in Unix Timestamp in Milliseconds. [converter](https://www.unixtimestamp.com/)
## - Напоминания
Напоминания за 2 часа и за день до консультации записываются в файл reminders.log в корне проекта.

Во время тестов и в режиме тестирования (npm start:test), для наглядности, напоминания так же записываются моментально, и имеют префикс 'TEST-'.

## Запуск тестов

### Unit тесты
    npm run test
### e2e тесты
    npm run test:e2e


# API для записи человека на онлайн-консультацию к юристу с заблаговременным напоминанием.

## Установка и запуск

    npm install
    npm run build
    npm start

Для полноценного запуска API необходимо создать .env файл в корне проекта, взяв за образец .env.example.

Для удобства, чтобы не поднимать сервер MongoDB и не настраивать подключение, можно добавить переменную NODE_ENV со значением "test" в созданный .env файл.

    .env
    NODE_ENV=test

В этом случае будет использован [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server), вместо подключения к реальной базе данных.

## Подготовка базы данных

Для добавления в базу данных четырех пользователей (2 юристов и 2 клиентов). Необходимо сделать запрос на

    GET /user/seed

тело ответа будет содержать информацию для последующей авторизации. 
## REST API
### - Регистрация
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

### - Запись клиента на консультацию 
(пользователь должен быть авторизован)

    POST /meeting/sign-up

Тело запроса должно содержать:

	clientId: string;
	lawyerId: string;
    time: number;


## - Напоминания
Напоминания за 2 часа и за день до консультации записываются в файл reminders.log в корне проекта.

Во время тестов и в режиме тестирования (NODE_ENV=test), для наглядности, напоминания так же записываются моментально, и имеют префикс 'TEST-'.

## Запуск тестов

### Unit тесты
    npm run test
### e2e тесты
    npm run test:e2e


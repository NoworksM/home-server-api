import EnvironmentType from "./EnvironmentType";

const config = {
    environment: EnvironmentType.Development,
    server: {
        port: 8081,
        clientAddress: "http://localhost:3000"
    },
    security: {
        jwtSecret: "TestSecret, please change",
        hashRounds: 11
    },
    seed: {
        roles: ["Admin", "Owner"],
        readingTypes: ["Temperature", "Humidity"],
        users: [
            {
                email: "admin@fakedomain.empty",
                firstName: "Admin",
                lastName: "User",
                password: "password",
                roles: ["Admin"]
            },
            {
                email: "testuser@fakedomain.empty",
                firstName: "Test",
                lastName: "User",
                password: "TestPassword",
                roles: []
            }
        ],
        properties: [
            {
                name: "Test Property 1",
                users: [],
                rooms: [
                    {
                        name: "Test Room 1",
                        sensors: [
                            {
                                name: "Test Sensor 1-1",
                                secret: "TestSecret"
                            },
                            {
                                name: "Test Sensor 1-2",
                                secret: "TestSecret"
                            }
                        ]
                    },
                    {
                        name: "Test Room 2",
                        sensors: [
                            {
                                name: "Test Sensor 2-1",
                                secret: "TestSecret"
                            }
                        ]
                    }
                ]
            },
            {
                name: "Test Property 2",
                users: [
                    {
                        email: "testuser@fakedomain.empty",
                        role: "Owner"
                    }
                ],
                rooms: [
                    {
                        name: "Test Room 1",
                        sensors: [
                            {
                                name: "Test Sensor 1-1",
                                secret: "TestSecret"
                            },
                            {
                                name: "Test Sensor 1-2",
                                secret: "TestSecret"
                            }
                        ]
                    },
                    {
                        name: "Test Room 2",
                        sensors: [
                            {
                                name: "Test Sensor 2-1",
                                secret: "TestSecret"
                            }
                        ]
                    }
                ]
            }
        ],
        readings: [
            {
                start: "2021-02-01",
                end: "2021-03-01",
                readingType: "Temperature",
                property: "Test Property 1",
                room: "Test Room 1",
                sensor: "Test Sensor 1-1",
                frequencyInSeconds: 60,
                dataCenter: 70,
                oscilations: 20,
                amplitude: 5,
                deviation: 0.75
            },
            {
                start: "2021-02-01",
                end: "2021-03-01",
                readingType: "Humidity",
                property: "Test Property 1",
                room: "Test Room 1",
                sensor: "Test Sensor 1-1",
                frequencyInSeconds: 60,
                dataCenter: 0.5,
                oscilations: 20,
                amplitude: 0.05,
                deviation: 0.0025
            },
            {
                start: "2021-02-01",
                end: "2021-03-01",
                readingType: "Temperature",
                property: "Test Property 1",
                room: "Test Room 1",
                sensor: "Test Sensor 1-2",
                frequencyInSeconds: 60,
                dataCenter: 70,
                oscilations: 20,
                amplitude: 5,
                deviation: 0.75
            },
            {
                start: "2021-02-01",
                end: "2021-03-01",
                readingType: "Humidity",
                property: "Test Property 1",
                room: "Test Room 1",
                sensor: "Test Sensor 1-2",
                frequencyInSeconds: 60,
                dataCenter: 0.5,
                oscilations: 20,
                amplitude: 0.05,
                deviation: 0.0075
            }
        ]
    }
};

export default config;
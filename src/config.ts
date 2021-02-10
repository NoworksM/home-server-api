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
        roles: ["Admin"],
        readingTypes: ["Temperature", "Humidity"]
    }
};

export default config;
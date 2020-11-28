import EnvironmentType from "./EnvironmentType";

const config = {
    environment: EnvironmentType.Development,
    server: {
        port: 8081,
        clientAddress: "http://localhost:8080"
    },
    security: {
        jwtSecret: "TestSecret, please change",
        hashRounds: 11
    },
    seed: {
        roles: ["Admin"]
    }
};

export default config;
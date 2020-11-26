const config = {
    server: {
        port: 8081,
        clientAddress: "http://localhost:8080"
    },
    security: {
        jwtSecret: "TestSecret, please change",
        hashRounds: 11
    }
};

export default config;
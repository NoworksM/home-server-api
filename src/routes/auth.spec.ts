import initialized from "../server";
import request from "supertest";
import {Server} from "http";
import testOrmConfig from "../../testOrmConfig";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import * as bcrypt from "../util/bcrypt";
import config from "../config";
import Sensor from "../entity/Sensor";

let app: Server;
let testUser = new User();
let testSensor = new Sensor();
const testUserPassword = "testpass";
const testSensorSecret = "testsecret";

beforeAll(async () => {
    app = await initialized(testOrmConfig);

    const userRepo = await getRepository(User);

    testUser.email = "unittestaccount@fakedomain.test";
    testUser.firstName = "Test";
    testUser.lastName = "User";
    testUser.passwordHash = await bcrypt.hash(testUserPassword, config.security.hashRounds);

    await userRepo.delete({email: testUser.email});

    testUser = await userRepo.save(testUser);

    const sensorRepo = await getRepository(Sensor);

    testSensor.name = "zxe_unit_test_sensor";
    testSensor.secretHash = await bcrypt.hash(testSensorSecret, config.security.hashRounds);

    sensorRepo.delete({name: testSensor.name});

    testSensor = await sensorRepo.save(testSensor);
});

afterAll(async () => {
    const userRepo = await getRepository(User);

    await userRepo.delete({email: testUser.email});

    const sensorRepo = await getRepository(Sensor);

    await sensorRepo.delete({name: testSensor.name});
})

describe("login should generate appropriate responses", () => {
    it("should reject non-existent users", (done) => {
        const vm = {
            email: "123njn5j452n6098g0fadshung9dafgu9afdgsjnagfdsoj@gmail.com",
            password: "fdsajklnfdsanjkfdsakjln"
        };

        request(app)
            .post("/auth")
            .send(vm)
            .expect(400)
            .end(done);
    });

    it("should return a token on a successful login",  (done) => {
        request(app)
            .post("/auth")
            .send({email: testUser.email, password: testUserPassword})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect((res) => {
                const resp = JSON.parse(res.text);
                expect(resp).toHaveProperty("token");
            })
            .end(done);
    });

    it("should return 400 on an unsuccessful login",  (done) => {
        request(app)
            .post("/auth")
            .send({email: testUser.email, password: "badpassword"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400)
            .expect((res) => {
                const resp = JSON.parse(res.text);
                expect(resp).toHaveProperty("message");
                expect(resp.message).toBe("Credentials did not match");
                expect(resp).toHaveProperty("validationErrors");
                expect(resp.validationErrors).toHaveLength(0);
            })
            .end(done);
    });
});

describe("sensor auth should generate appropriate responses", () => {
    it("should reject non-existent users", (done) => {

        request(app)
            .post("/auth/sensor")
            .send({sensorId: "sadfkjfdsalkbhjnadsfjklh", secret: "sfadgjkbdsafjhkgjhlkasfd"})
            .expect(400)
            .end(done);
    });

    it("should return a token on a successful sensor auth",  (done) => {
        request(app)
            .post("/auth/sensor")
            .send({sensorId: testSensor.id, secret: testSensorSecret})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect((res) => {
                const resp = JSON.parse(res.text);
                expect(resp).toHaveProperty("token");
            })
            .end(done);
    });

    it("should return 400 on an unsuccessful sensor auth",  (done) => {
        request(app)
            .post("/auth/sensor")
            .send({sensorId: testSensor.id, secret: "badsecret"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400)
            .expect((res) => {
                const resp = JSON.parse(res.text);
                expect(resp).toHaveProperty("message");
                expect(resp.message).toBe("Sensor credentials did not match");
                expect(resp).toHaveProperty("validationErrors");
                expect(resp.validationErrors).toHaveLength(0);
            })
            .end(done);
    });
});
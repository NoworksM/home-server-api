import initialized from "../server";
import request from "supertest";
import {Server} from "http";
import testOrmConfig from "../../testOrmConfig";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import * as bcrypt from "../util/bcrypt";
import config from "../config";
import Sensor from "../entity/Sensor";
import jwt from "jsonwebtoken";
import ReadingType from "../entity/ReadingType";
import Room from "../entity/Room";
import Property from "../entity/Property";
import SensorLocation from "../entity/SensorLocation";
import moment from "moment";
import Reading from "../entity/Reading";
import fs from "fs";
import * as uuid from "uuid";

let app: Server;
let testUser = new User();
let testSensor = new Sensor();
let testUnassignedSensor = new Sensor();
let testProperty = new Property();
let testRoom = new Room();
let testSensorLocation = new SensorLocation();
let userToken: string;
let sensorToken: string;
let unassignedSensorToken: string;
let testReadingType = new ReadingType();
const testUserPassword = "testpass";
const testSensorSecret = "testsecret";

beforeAll(async () => {
    fs.unlinkSync("mydb.test.sqlite3");

    app = await initialized(testOrmConfig);

    const userRepo = await getRepository(User);

    testUser.email = "unittestaccount@fakedomain.test";
    testUser.firstName = "Test";
    testUser.lastName = "User";
    testUser.passwordHash = await bcrypt.hash(testUserPassword, config.security.hashRounds);

    await userRepo.delete({email: testUser.email});

    testUser = await userRepo.save(testUser);

    userToken = jwt.sign({userId: testUser.id}, config.security.jwtSecret);

    const roomRepo = await getRepository(Room);
    await roomRepo.delete({name: testRoom.name});

    const propertyRepo = await getRepository(Property);

    testProperty.name = "Test Property";
    await propertyRepo.delete({name: testProperty.name});
    testProperty = await propertyRepo.save(testProperty);

    testRoom.name = "Test Room";
    testRoom.property = testProperty;
    testRoom = await roomRepo.save(testRoom);

    const sensorRepo = await getRepository(Sensor);

    testSensor.name = "zxe_unit_test_sensor";
    testSensor.secretHash = await bcrypt.hash(testSensorSecret, config.security.hashRounds);
    await sensorRepo.delete({name: testSensor.name});
    testSensor = await sensorRepo.save(testSensor);

    const sensorLocationRepo = await getRepository(SensorLocation);

    testSensorLocation.start = moment().subtract(30, "days").toDate();
    testSensorLocation.sensor = testSensor;
    testSensorLocation.room = testRoom;
    await sensorLocationRepo.delete({sensor: testSensor});
    testSensorLocation = await sensorLocationRepo.save(testSensorLocation);

    testUnassignedSensor.name = "axe_unit_test_sensor_unassigned";
    testUnassignedSensor.secretHash = await bcrypt.hash(testSensorSecret, config.security.hashRounds);
    await sensorRepo.delete({name: testUnassignedSensor.name});
    testUnassignedSensor = await sensorRepo.save(testUnassignedSensor);

    sensorToken = jwt.sign({sensorId: testSensor.id}, config.security.jwtSecret);
    unassignedSensorToken = jwt.sign({sensorId: testUnassignedSensor.id}, config.security.jwtSecret);

    const readingTypeRepo = await getRepository(ReadingType);

    testReadingType.value = "Test Type";
    await readingTypeRepo.delete({value: testReadingType.value});
    testReadingType = await readingTypeRepo.save(testReadingType);
});

afterAll(async () => {
    const userRepo = await getRepository(User);

    await userRepo.delete({email: testUser.email});

    const readingsRepo = await getRepository(Reading);
    await readingsRepo.delete({});

    const readingTypeRepo = await getRepository(ReadingType);
    await readingTypeRepo.delete({value: testReadingType.value});

    const sensorLocationRepo = await getRepository(SensorLocation);
    await sensorLocationRepo.delete({id: testSensorLocation.id});

    const sensorRepo = await getRepository(Sensor);

    await sensorRepo.delete({name: testSensor.name});
    await sensorRepo.delete({name: testUnassignedSensor.name});

    const roomRepo = await getRepository(Room);
    await roomRepo.delete(testRoom);

    const propertyRepo = await getRepository(Property);
    await propertyRepo.delete(testProperty);

    app.close();
});

describe("/auth", () => {

    describe("login should generate appropriate responses", () => {
        it("should reject incorrect data", (done) => {
            request(app)
                .post("/auth")
                .send({sensorId: "sdffdsafds", secret: "testsecret"})
                .expect(400)
                .end(done);
        });

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

        it("should return a token on a successful login", (done) => {
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

        it("should return 400 on an unsuccessful login", (done) => {
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
        it("should reject incorrect data", (done) => {
            request(app)
                .post("/auth/sensor")
                .send({username: "test", password: "testpass"})
                .expect(400)
                .end(done);
        });

        it("should reject non-existent users", (done) => {
            request(app)
                .post("/auth/sensor")
                .send({sensorId: uuid.v4(), secret: "sfadgjkbdsafjhkgjhlkasfd"})
                .expect(400)
                .end(done);
        });

        it("should return a token on a successful sensor auth", (done) => {
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

        it("should return 400 on an unsuccessful sensor auth", (done) => {
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

});

describe("/readings", () => {
    describe("/", () => {

        it("should now allow users to post", (done) => {
            request(app)
                .post("/readings")
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${userToken}`)
                .send({type: "Temperature", value: 73.2})
                .expect(401)
                .expect("Content-Type", /json/)
                .end(done);
        });

        it("should not create readings if the type doesn't exist", (done) => {
            request(app)
                .post("/readings")
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${sensorToken}`)
                .send({type: "Invalid Type that isn't in the database", value: 73.2})
                .expect(400)
                .expect("Content-Type", /json/)
                .end(done);
        });

        it("should not create readings for sensors that aren't assigned to a room currently", (done) => {
            request(app)
                .post("/readings")
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${unassignedSensorToken}`)
                .send({type: testReadingType.value, value: 73.2})
                .expect(400)
                .expect("Content-Type", /json/)
                .end(done);
        });

        it("should reject incorrect data", (done) => {
            request(app)
                .post("/readings")
                .set("Accept", "application.json")
                .set("Authorization", `Bearer ${sensorToken}`)
                .send({type: testReadingType.value, floatValue: 73.2})
                .expect(400)
                .expect("Content-Type", /json/)
                .end(done);
        });

        it("should allow sensors to post", (done) => {
            request(app)
                .post("/readings")
                .set("Accept", "application.json")
                .set("Authorization", `Bearer ${sensorToken}`)
                .send({type: testReadingType.value, value: 73.2})
                .expect(200)
                .expect("Content-Type", /json/)
                .end(done);
        });
    });
});
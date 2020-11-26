import * as bcrypt from 'bcryptjs';

export function genSalt(rounds: number): Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(rounds, function (err, salt) {
            if (err) {
                reject(err);
            } else {
                resolve(salt);
            }
        });
    });
}

export function hash(value: string, saltOrRounds: string|number): Promise<string> {
    if (typeof saltOrRounds === 'number') {
        return new Promise<string>((resolve, reject) => {
            bcrypt.hash(value, <number> saltOrRounds, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });
    } else {
        return new Promise<string>((resolve, reject) => {
            bcrypt.hash(value, <string> saltOrRounds, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });
    }
}

export function compare(value: string, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(value, hash, (err, success) => {
            if (err) {
                reject(err);
            } else {
                resolve(success);
            }
        });
    });
}
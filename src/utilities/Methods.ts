export function objectToLowerCase(object: any) {
    const newObject: any = {};

    for (const key of Object.keys(object)) {
        newObject[key.toLocaleLowerCase()] = object[key]
    }

    return newObject
}
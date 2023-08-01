type UserRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}

type UserLogin = {
    email: string,
    password: string
}

type UserReturnWithEmail = {
    firstName: string,
    lastName: string,
    email:string
}

type UserReturn = {
    firstName: string,
    lastName: string
}
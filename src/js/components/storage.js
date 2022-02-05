export default class storage {
    get (name){
        return localStorage.getItem(name);
    }
    set(name,value){
        localStorage.setItem(name, value);
    }
}
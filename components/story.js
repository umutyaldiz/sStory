import thumbCreate from './thumbCreate';

export default class Story {
    constructor(props){
        this.options = Object.assign({}, props);
        this.init();
    }
    init(){
        new thumbCreate(this.options);
    }
}

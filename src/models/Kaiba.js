import axios from 'axios'

class KaibasModel {

    static cards(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/kaiba.json")
        return request
    }

}

export default KaibasModel
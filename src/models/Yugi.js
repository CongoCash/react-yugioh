import axios from 'axios'

class YugisModel {

    static cards(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/yugi.json")
        return request
    }

}

export default YugisModel
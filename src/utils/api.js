import axios from "axios";

const helper = () => {
    const MainROUTE = 'http://172.29.4.10:8000/'
    const post = async (addr, data) => {
        const res = await axios.post(MainROUTE + addr, data)
        return res.data
    }
    const remove = async (addr, id) => {
        await axios.delete(MainROUTE + addr + '/' + id)
    }
    const get = async (addr) => {
        const res = await axios.get(MainROUTE + addr)
        return res.data
    }
    const fetchAudio = async (addr) => {
        const res = await axios.get(MainROUTE + addr, {
            responseType: 'blob' // Expecting a binary image file
        })
        return res.data
    }
    return {
        post,
        get,
        remove,
        fetchAudio,
        MainROUTE
    };
}


export default helper
import axios from "axios";

const helper = () => {
    const myROUTE = 'http://172.29.4.10:8000/'
    const post = async (addr, data) => {
        const res = await axios.post(myROUTE + addr, data)
        return res.data
    }
    const remove = async (addr, id) => {
        await axios.delete(myROUTE + addr + '/' + id)
    }
    const get = async (addr) => {
        const res = await axios.get(myROUTE + addr)
        return res.data
    }
    const fetchAudio = async (addr) => {
        const res = await axios.get(myROUTE + addr, {
            responseType: 'blob' // Expecting a binary image file
        })
        return res.data
    }
    return {
        post,
        get,
        remove,
        fetchAudio
    };
}


export default helper
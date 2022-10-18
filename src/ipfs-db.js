import * as IPFS from 'ipfs-core'
import Database from './db.js'
/**
 * Each file is stored as a path
 * And each entry is an array of the different versions of the file
 * since IPFS is immutable, and files are stored under a unique CID hash
 * Here, we are crudely mimicking this by creating an array of versions
 * for each entry. Like so:
 * 
 * {
 *   "filename":
 *     [
 *          { cid:"hashQmQ2...", version: 2.0 },
 *          { cid:"hashQmH1...", version: 1.9 },
 *          ...
 *     ]
 * }
 */
class IpfsDB{
    constructor(dbName="IpfsDB"){
        this.localDB = new Database(dbName)
        this.cache = {}
        this.ipfs = {}
        this.started = false;
    }

    async start(){
        this.ipfs = await IPFS.create()

        // const all = await this.localDB.getAll()
        // for await(let listOfVersions of all){
            
        //     const topElement = listOfVersions[0]
        //     this.cache[topElement.path] = listOfVersions
        // }
        this.started = true
        return this.ipfs
    }

    async cat(cid){
        const decoder = new TextDecoder()
        let text = ''

        for await (const chunk of this.ipfs.cat(cid)) {
            
            text += decoder.decode(chunk, {
            stream: true
            })
        }

        return text
    }

    async getCurrentIpfsEntries(){
        //From array of filenames or paths, retrieve most 
        //up to date versions of IPFS files
        //This might take a while to run, so only run on startup
    }

    async add({ contentPath, content }){
        if(!this.started) throw new Error('IpfsDB is not started')
        
        try{
            const { path, cid } = await this.ipfs.add({
                path: contentPath,
                content: content,
            });
            
            const newEntry = {
                content:content,
                timestamp:Date.now(),
                cid:cid
            }

            if(!this.cache[path]) this.cache[path] = []
            this.cache[path].unshift(newEntry)

            await this.localDB.put(path, newEntry)

            return { 
                success:`Item ${path} was successfully added to IPFS`,
                ...newEntry
            }

        }catch(e){
            throw e
        }
        
    }

    async get(key){
        try{
            if(this.cache[key]) return this.cache[key]
            //Fall back on localDB file entries
            // const entry = await this.localDB.get(key)
            // if(entry) return entry
            //If not, fallback on calling IPFS
            const entryFromIPFS = await this.cat(key)
            
            return entryFromIPFS
        }catch(e){
            throw e
        }
    }

}

(async ()=>{
    const i = new IpfsDB('test')
    await i.start()

    await i.add({
        contentPath:"test1",
        content:"this is cool"
    })

    setTimeout(async ()=>{
        await i.add({
            contentPath:"test2",
            content:"this is SPARTA"
        })
       await i.add({
            contentPath:"test3",
            content:"this is SPARTA x2"
        })
        await i.add({
            contentPath:"test4",
            content:"this is SPARTA x3"
        })

       const resultAdd = await i.add({
            contentPath:"test5",
            content:"aowidjoaiwdjoaiwdjoaiwjdoaiwjdoiajwdoiajwdoiajwdoiajwdoiajwwdoiajwdoiawjdoiajwdoiajwdoiajwdoiajwdoiajwdoiajwdoijawvv kjcjnoiwoijdd nv io oic nksoijadnj   ioawodijj   jawioawio   oinawoic  ioawonc ncciojaw  ookpakawdjn jnawuiawiuaijo jn"
        })
        
        console.time("Trying to get")
        const gotten = await i.get(resultAdd.cid)
        console.log('Got :', gotten)
        console.timeEnd("Trying to get")
    }, 5000)
})()
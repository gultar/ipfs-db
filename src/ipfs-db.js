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
        this.cache = new Database(dbName)
        this.ipfs = {}
        this.started = false;
    }

    async start(){
        this.ipfs = await IPFS.create()
        this.cache.init()
        this.cidStore = {} //{ "filename":"CID object" }
        this.fetchCachedCIDs()
        this.started = true
        return this.ipfs
    }

    async fetchCachedCIDs(){
        const cachedCIDs = await this.cache.get('CachedCIDs');
        if(cachedCIDs === false) this.cidStore = {}
        else this.cidStore = cachedCIDs

        return;
    }

    async saveCID(path, cid){
        this.cidStore[path] = cid.toString()
        const savedCache = await this.saveCIDsCache(this.cidStore)

        return savedCache
    }

    async saveCIDsCache(cids){
        const saved = await this.cache.put('CachedCIDs', cids)
        return saved
    }

    async getFromIpfs(cid){
        const decoder = new TextDecoder()
        let content = ''

        for await (const chunk of this.ipfs.cat(cid)) {
            content += decoder.decode(chunk, { stream: true })
        }

        return content
    }

    async addToIpfs(contentPath, content){
        return await this.ipfs.add({
            path: contentPath,
            content: content,
        });
    }

    validateContentFormat(content){
        if(typeof content === 'object'){
            return JSON.stringify(content)
        }else if(typeof content === 'number'){
            return content.toString()
        }else if(content === undefined){
            throw new Error('Content to be added to IPFS cannot be undefined')
        }

        return content

        
    }

    async add({ path, content }){
        if(!this.started) throw new Error('IpfsDB is not started')
        
        try{
            const validatedContent = this.validateContentFormat(content)
            const { cid } = await this.addToIpfs(path, validatedContent)
            const saved = await this.saveCID(path, cid)

            return { 
                success:`Item ${path} was successfully added to IPFS`,
                content:content,
                cid:cid
            }

        }catch(e){
            console.error(e)
        }
        
    }

    async get(path){
        const cid = this.cidStore[path]
        if(cid === undefined) return false;

        const content = await this.getFromIpfs(cid)

        return content
    }

}

(async ()=>{
    const i = new IpfsDB('test')
    await i.start()

    setTimeout(async ()=>{

    }, 2000)

})()
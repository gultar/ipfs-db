import * as IPFS from 'ipfs-core'
import Database from './db.js'

class IpfsDB{
    constructor(dbName="IpfsDB"){
        this.localDB = new Database(dbName)
        // this.cidTracker = new Database('CidTracker')
        this.cidTracker = {}
        this.ipfs = {}
        this.started = false;
    }

    async start(){
        this.ipfs = await IPFS.create()

        const all = await this.localDB.getAll()
        for await(let entry of all){
            this.cidTracker[entry.path] = entry
        }
        this.started = true;
        return this.ipfs
    }

    async add({ contentPath, content }){
        if(!this.started) throw new Error('IpfsDB is not started')
        
        try{
            const { path, cid } = await this.ipfs.add({
                path: contentPath,
                content: content,
            });
            
            const previousEntries = this.cidTracker[path]
            this.cidTracker[path] = [
                {
                    content:content,
                    timestamp:Date.now(),
                    cid:cid
                },
                ...previousEntries
            ]
    
            // const result = await this.localDB.put(path, {
            //     cid:cid,
            //     hash:cid.hash,
            //     content:content,
            //     path:path
            // })

            // console.log('result',result)
        }catch(e){
            throw e
        }
        
    }

    async get(key){
        const fromCidTracker = this.cidTracker[key];
        
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

        
        console.log('CID',i.cidTracker)
    }, 5000)
})()
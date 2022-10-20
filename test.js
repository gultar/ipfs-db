import assert from 'assert'
import Database from './src/db.js'
import IpfsDB from './src/ipfs-db'
import fs from 'fs'
let database = new Database('test')
describe('Database initializes well', async ()=>{
    
    it('Does not throw an error', async ()=>{
        const isInitialized = await database.init()
        assert.equal(isInitialized, true)
            
    })
    
    it("Creates a data/ directory", ()=>{
        const dataDirectory = fs.existsSync('./data/test');
        assert.equal(dataDirectory, true)
    })
});

describe("Database adds, gets, updated and deletes entries correctly", ()=>{
    it("Creates an entry", async ()=>{
        const created = await database.put("muppet", "les poubelles sont belles")
        assert.equal(typeof created == "object" && !created.error, true)
    })
    
    it("Gets entry successfully", async ()=>{
        const entry = await database.get("muppet")
        assert.equal(entry, "les poubelles sont belles")
    })

    it("Updates entry successfully", async ()=>{
        const isUpdated = await database.put("muppet", "les poubelles ne sont pas belles")
        assert.equal((isUpdated && !isUpdated.error ? true : false), true)
        const entry = await database.get("muppet")
        assert.equal(entry, "les poubelles ne sont pas belles")
    })
    it("Deletes entry successfully", async()=>{
        const deleted = await database.delete("muppet")
        assert.equal((deleted && !deleted.error ? true : false), true)
    })
})
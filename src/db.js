import store from 'rocket-store';

export default class Database{
    constructor(dbName, options={}){
        this.store = store;
        this.name = dbName;
        this.isConfigSet = false;
        this.dataFolder = `./data/${dbName}`
        this.otherOptions = options
    }

    async init(){
        if(this.isConfigSet == true) return true;

        try{
            const defaultOptions = {
                data_storage_area :this.dataFolder,
                data_format       : this.store._FORMAT_JSON,
                ...this.otherOptions
            }

            //Data storage directory is generated here
            const dataFolderCreated = await this.store.options(defaultOptions);
            this.isConfigSet = true;
            return true;
        }catch(e){
            console.error(e)
        }
    }

    
    async put(key, record){
        try{
            
            if(key == undefined) throw new Error("Cannot put to Database: key is undefined")
            if(record  == undefined) throw new Error("Cannot put to Database: record is undefined")
    
            const written = await this.store.post(this.name, key, record)
            return written
        }catch(e){
            console.error(e)
        }
        
    }

    async get(key){
        try{
            
            if(key == undefined) throw new Error("Cannot read to Database: key is undefined")
    
            const entry = await this.store.get(this.name, key);
            
            const results = entry.result
            if(Array.isArray(results) && results.length > 0) return results[0]
            else return false
        }catch(e){
            console.error(e)
        }

       
    }

    async getAll(){
        try{
            
            const entry = await this.store.get(this.name, '*');
            const results = entry.result
           
            if(Array.isArray(results) && results.length > 0){
                return results
            }else{
                return []
            }
        }catch(e){
            console.error(e)
        }
        

    }

    async getAllKeys(){
        try{
            
            const entry = await this.store.get(this.name, '*');
            const results = entry.key
    
           
            if(Array.isArray(results) && results.length > 0){
                return results
            }else{
                return []
            }
        }catch(e){
            console.error(e)
        }
        

    }

    async delete(key){
        try{
            
            if(key == undefined) throw new Error('ERROR: Could not delete because ID is undefined') 
            const deleted = await this.store.delete(this.name, key)
            return deleted
        }catch(e){
            console.error(e)
        }
    }

    async destroy(){
        try{
            //destroys the entire database
            const destroyed = await this.store.delete(this.name)
            return destroyed
        }catch(e){
            console.error(e)
        }
    }


}
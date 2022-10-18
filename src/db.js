import store from 'rocket-store';

export default class Database{
    constructor(dbName, options={}){
        this.database = store;
        this.name = dbName;
        this.isConfigSet = false;
        this.dataFolder = `./data/${dbName}`
        this.options = options
    }

    async init(){
        if(!this.isConfigSet){
            try{
                let defaultOptions = {
                    data_storage_area :this.dataFolder,
                    data_format       : this.database._FORMAT_JSON,
                }
    
                //If there are additional options on rocket-store, adds them
                //to the default options
                if(this.options){
                    defaultOptions = { ...defaultOptions, ...this.options }
                }
    
                await this.database.options(defaultOptions);
                this.isConfigSet = true;
                return {success:"Database has already been initialized"};
            }catch(e){
                throw new Error(e.message)
            }
        }

        return {already:"Database has already been initialized"};

        
    }

    
    async put(key, record){
        try{
            
            await this.init()
            if(!key) throw new Error("Cannot put to Database: key is undefined")
            if(!record) throw new Error("Cannot put to Database: record is undefined")
    
            let written = await this.database.post(this.name, key, record)
            return written
        }catch(e){
            throw new Error(e.message)
        }
        
    }

    //To be deprecated
    async add(entry){
        try{
            await this.init()
            if(!entry._id && entry.id) entry._id == entry.id
            if(!entry._id && !entry.id) throw new Error("Cannot add to Database: Id is undefined")

            let written = await this.database.post(this.name, entry._id, entry)
            return written
            
        }catch(e){
            throw new Error(e.message)
        }
        
    }

    async get(key){
        try{
            await this.init()
            if(!key) throw new Error("Cannot read to Database: Id is undefined")
    
            let entry = await this.database.get(this.name, key);
            
            let results = entry.result
            if(Array.isArray(results) && results.length > 0) return results[0]
            else return false
        }catch(e){
            throw new Error(e.message)
        }

       
    }

    async getAll(){
        try{
            await this.init()
            let entry = await this.database.get(this.name, '*');
            let results = entry.result
           
            if(Array.isArray(results) && results.length > 0){
                return results
            }else{
                return []
            }
        }catch(e){
            throw new Error(e.message)
        }
        

    }

    async getAllKeys(){
        try{
            await this.init()
            let entry = await this.database.get(this.name, '*');
            let results = entry.key
    
           
            if(Array.isArray(results) && results.length > 0){
                return results
            }else{
                return []
            }
        }catch(e){
            throw new Error(e.message)
        }
        

    }

    async delete(key){
        try{
            await this.init()

            if(!key) throw new Error('ERROR: Could not delete because ID is undefined') 
            else {
                let deleted = await this.database.delete(this.name, key)
                return deleted
            }
        }catch(e){
            throw new Error(e.message)
        }
    }

    async destroy(){
        try{
            await this.init()
    
            let deleted = await this.database.delete(this.name)
            return deleted
        }catch(e){
            throw new Error(e.message)
        }
    }


}
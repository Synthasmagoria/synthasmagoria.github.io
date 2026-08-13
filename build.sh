cd xoark_database
odin run create_database_binary -- ../articles/xoark_shared/xoark_db.bin
cd ..
odin run generator -- articles website

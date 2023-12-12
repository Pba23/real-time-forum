#!/bin/bash

cd ../data/sql
echo "init"
sqlite3 forum.db < init.sql
echo "delete"
sqlite3 forum.db < delete.sql
echo "insert"
sqlite3 forum.db < insert.sql
echo "finish"
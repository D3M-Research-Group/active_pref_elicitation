#!/bin/bash
for file in house_query3/*.sh;
do
	sed -i 's/\r//' "$file";
	sbatch "$file"
done;
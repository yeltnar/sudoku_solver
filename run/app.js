const fs = require('fs');

const complex_print = true;

// easy one 
// const source = 
// [
//     [null,2,6,9,null,null,1,null,8],
//     [null,null,8,null,4,5,2,null,null],
//     [3,null,5,null,null,null,7,null,4],
//     [null,5,2,null,null,9,null,null,null],
//     [9,null,null,3,null,6,null,null,null],
//     [null,null,null,2,null,null,9,4,null],
//     [6,null,1,null,null,null,5,null,7],
//     [null,null,9,7,6,null,4,null,null],
//     [2,null,7,null,null,4,3,6,null],
// ];

// hard one 
const source = 
[
    [4,null,null,9,null,1,null,null,null],
    [7,null,null,null,null,3,null,null,null],
    [6,2,null,null,null,null,null,null,3],
    [null,null,5,null,null,null,null,1,6],
    [null,null,null,5,null,6,null,null,null],
    [1,4,null,null,null,null,7,null,null],
    [2,null,null,null,null,null,null,5,7],
    [null,null,null,4,null,null,null,null,9],
    [null,null,null,1,null,9,null,null,2],
];

const FULL_OBJ = {
    1:true,
    2:true,
    3:true,
    4:true,
    5:true,
    6:true,
    7:true,
    8:true,
    9 :true,
};

function solvePuzzle(source){

    did_work = false

    let work_obj = replaceNullWithUnfiltered(source); 

    do{

        work_obj = limitByRow(work_obj);
        work_obj = limitByColumn(work_obj);
        work_obj = limitBySegment(work_obj);
    
        let {new_work_obj, new_did_work} = pullUpSelection(work_obj);
    
        work_obj = new_work_obj
        did_work = new_did_work

    }while(did_work)

    _print(work_obj, complex_print);

    fs.writeFileSync('../work_obj.json',JSON.stringify(work_obj));
}

function replaceNullWithUnfiltered(puzzle){

    return puzzle.map((line, i, arr)=>{

        let line_to_return = line.map((cur, i, arr)=>{

            let to_return = cur; 

            if(cur===null){
                to_return = JSON.parse(JSON.stringify(FULL_OBJ));
            }

            return to_return;
        });

        return line_to_return;
    });
}

function pullUpSelection(work_obj){

    let new_did_work = false;

    new_work_obj =  work_obj.map((row, row_number, arr)=>{

        const mapped_row = row.map((cur, column_number, arr)=>{
            
            const keys = Object.keys(cur);

            if( keys.length===1 ){
                console.log(`pulling up ${keys[0]}... row_number is ${row_number} column_number is ${column_number}`);
                new_did_work = true;
                return parseInt(keys[0]);
            }else{
                return cur;
            }
        });

        return mapped_row;
    });

    return {
        new_work_obj,
        new_did_work,
    }
}

function limitByRow( work_obj ){

    return work_obj.map((cur, i, arr)=>{

        const row = cur;

        const used_numbers = row.reduce((used_numbers, cur)=>{
            if(typeof cur==='number'){
                used_numbers.push(cur);
            }
            return used_numbers;
        },[]);

        row.forEach((cur, i, arr)=>{
            if(typeof cur==='object'){
                used_numbers.forEach((to_delete)=>{ 
                    delete cur[to_delete];
                });
                
            }
        });

        return row;

    });
}

function limitByColumn( work_obj ){

    const used_arr_columns = work_obj.reduce((used_arr, row, i, arr)=>{
        row.forEach((cur, i, arr)=>{
            used_arr[i] = used_arr[i] || [];

            if(typeof cur==='number'){
                used_arr[i].push(cur);
            }
        });
        return used_arr;
    },[]);

    return work_obj.map((row, outer_arr, outer_i)=>{

        row.forEach((cur, i, arr)=>{
            if(typeof cur==='object'){
                used_arr_columns[i].forEach((found_number)=>{
                    delete cur[found_number];
                });
            }
        });

        return row;
    });

}

function limitBySegment( work_obj ){

    // const segment_found_arr = [];

    const segment_found_arr = work_obj.reduce((acc, row, row_number)=>{

        row.forEach((cur, column_number)=>{

            if(typeof cur==='number'){
                const cur_segment = _lookUpSegment(row_number, column_number);
                acc[cur_segment] = acc[cur_segment] || [];
                acc[cur_segment].push(cur);
            }
        });

        return acc;
    }, []);

    work_obj.forEach((row, row_number)=>{

        row.forEach((cur, column_number)=>{

            if(typeof cur==='object'){
                const cur_segment = _lookUpSegment(row_number, column_number);
                segment_found_arr[cur_segment].forEach((ele_to_delete)=>{
                    delete cur[ele_to_delete];
                });
            }
        });
    }, []);

    // throw "not done";
    return work_obj;
}

function _print( work_obj, complex ){

    console.log('');

    work_obj.forEach((row, i, arr)=>{
        let to_print = [];
        row.forEach(( cur, i, arr )=>{
            
            if(complex===true){
                cur = typeof cur==='object' ? JSON.stringify(Object.keys(cur)) : cur; 
            }else{
                cur = typeof cur==='object' ? 'x' : cur; 
            }

            to_print.push(cur);
            if( (i+1)%3===0 ){to_print.push(" ");}
        });
        console.log(to_print.join(""));
        if((i+1)%3===0){console.log("");}
    });
}

function _lookUpSegment( row, column ){

    const segmentArr = [
        [0,0,0,1,1,1,2,2,2],
        [0,0,0,1,1,1,2,2,2],
        [0,0,0,1,1,1,2,2,2],
        [3,3,3,4,4,4,5,5,5],
        [3,3,3,4,4,4,5,5,5],
        [3,3,3,4,4,4,5,5,5],
        [6,6,6,7,7,7,8,8,8],
        [6,6,6,7,7,7,8,8,8],
        [6,6,6,7,7,7,8,8,8]
    ];

    try{
        return segmentArr[row][column];
    }catch(e){
        console.error(e);
        console.log(segmentArr);
        console.log(segmentArr[row]);
        console.error(`row is ${row} column is ${column}`);
        process.exit();
    }
}

(()=>{    
    const s = new Date();
    solvePuzzle(source);
    const e = new Date();
    console.log(`${e-s} ms run time`);
})()
const fs = require('fs');

const complex_print = false;

const easy_source = 
[
    ['x', 2,  6,  9, 'x','x', 1, 'x', 8 ],
    ['x','x', 8, 'x', 4,  5,  2, 'x','x'],
    [ 3, 'x', 5, 'x','x','x', 7, 'x', 4 ],
    ['x', 5,  2, 'x','x', 9, 'x','x','x'],
    [ 9, 'x','x', 3, 'x', 6, 'x','x','x'],
    ['x','x','x', 2, 'x','x', 9,  4, 'x'],
    [ 6, 'x', 1, 'x','x','x', 5, 'x', 7 ],
    ['x','x', 9,  7,  6, 'x', 4, 'x','x'],
    [ 2, 'x', 7, 'x','x', 4,  3,  6, 'x'],
];

const hard_source = 
[
    [ 4, 'x','x', 9, 'x', 1, 'x','x','x'],
    [ 7, 'x','x','x','x', 3, 'x','x','x'],
    [ 6,  2, 'x','x','x','x','x','x', 3 ],
    ['x','x', 5, 'x','x','x','x', 1,  6 ],
    ['x','x','x', 5, 'x', 6, 'x','x','x'],
    [ 1,  4, 'x','x','x','x', 7, 'x','x'],
    [ 2, 'x','x','x','x','x','x', 5,  7 ],
    ['x','x','x', 4, 'x','x','x','x', 9 ],
    ['x','x','x', 1, 'x', 9, 'x','x', 2 ],
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

const squareSegmentArr = [
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

const rowSegmentArr = [
    [0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6],
    [7,7,7,7,7,7,7,7,7],
    [8,8,8,8,8,8,8,8,8],
];

const columnSegmentArr = [
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8],
];

function solvePuzzle(source){

    did_work = false

    let work_obj = replaceNullWithUnfiltered(source); 

    do{

        work_obj = limitBySegment(work_obj, rowSegmentArr, 'row');
        work_obj = limitBySegment(work_obj, columnSegmentArr, 'column');
        work_obj = limitBySegment(work_obj, squareSegmentArr, 'square');
    
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

            if(cur===null || cur==='x'){
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

function limitBySegment( work_obj, segmentArr, name ){

    if(segmentArr===undefined||segmentArr===null){
        throw new Error(`segmentArr is ${segmentArr}`);
    }

    // const segment_found_arr = [];

    const segment_found_arr = work_obj.reduce((acc, row, row_number)=>{

        row.forEach((cur, column_number)=>{

            const cur_segment = _lookUpSegment(row_number, column_number, segmentArr);
            acc[cur_segment] = acc[cur_segment] || [];

            if(typeof cur==='number'){
                acc[cur_segment].push(cur);
            }
        });

        return acc;
    }, []);

    work_obj.forEach((row, row_number)=>{
        row.forEach((cur, column_number)=>{
            if(typeof cur==='object'){
                console.log(`row_number is ${row_number} column_number is ${column_number}`);
                const cur_segment_number = _lookUpSegment(row_number, column_number, segmentArr);
                segment_found_arr[cur_segment_number].forEach((ele_to_delete)=>{
                    delete cur[ele_to_delete];
                });
            }
        });
    }, []);

    console.log(`-----${name}-----`);

    // console.log(segment_found_arr)
    // process.exit();

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

function _lookUpSegment( row, column, segmentArr ){

    if(segmentArr===undefined||segmentArr===null){
        throw new Error(`segmentArr is ${segmentArr}`);
    }

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
    // solvePuzzle(easy_source);
    solvePuzzle(hard_source);
    const e = new Date();
    console.log(`${e-s} ms run time`);
})();
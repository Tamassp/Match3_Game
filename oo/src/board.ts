export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {}

export type BoardListener<T> = {}

export class Board<T> {
    height: number
    width: number
    pieces: T[][]


    constructor(generator: Generator<T>,  width: number, height: number) {
        this.height = height;
        this.width = width;
        let pieces = new Array(height);
        for(let row = 0; row < height; row++) {
            pieces[row] = new Array(width);
            for(let col = 0; col < width; col++) {
                pieces[row][col] = generator.next();
            }
        }
        //console.log(pieces);
        this.pieces = pieces
    }
    swap(first: Position, second: Position) {
        let firstPiece = this.piece(first);
        let secondPiece = this.piece(second);
        this.pieces[first.row][first.col] = secondPiece;
        this.pieces[second.row][second.col] = firstPiece;
    }
    match(firstPosition: Position, secondPosition: Position ): Match<T> | undefined {
        let piece: T = this.piece(firstPosition);
        this.swap(firstPosition, secondPosition);
        let match: Boolean = false;
        let positions: Position[] = [];
        positions.push(secondPosition);

        //HORIZONTAL CHECK
        let horizontalSteps = 1;
        //go left
        for(let i = secondPosition.col - 1; i >= 0; i--) {
            let currentPosition = {row: secondPosition.row, col: i};
            if(this.piece(currentPosition) == piece) {
                positions.push(currentPosition);
                horizontalSteps++;
            }
            else {
                break;
            }
        }    

        //go right
        for(let i = secondPosition.col + 1; i < this.width; i++) {
            let currentPosition = {row: secondPosition.row, col: i};
            if(this.piece(currentPosition) == piece) {
                positions.push(currentPosition);
                horizontalSteps++;
            }
            else{
                break;
            }
        }
        //We might have to put this condition outside the loop, in case we want to check if more than 3 pieces are matched     
        if(horizontalSteps >= 3){
            match = true;
        }
        else{
            positions = [];
        }
        
        //VERTICAL CHECK
        let verticalSteps = 1;
        //go up
        for(let i = secondPosition.row - 1; i >= 0; i--) {
            let currentPosition = {row: i, col: secondPosition.col};
            if(this.piece(currentPosition) == piece) {
                positions.push(currentPosition);
                verticalSteps++;
            }
            else {
                break;
            }
        }    
        //go down
        for(let i = secondPosition.row + 1; i < this.height; i++) {
            let currentPosition = {row: i, col: secondPosition.col};
            if(this.piece(currentPosition) == piece) {
                positions.push(currentPosition);
                verticalSteps++;
            }
            else{
                break;
            }
        }
        //We might have to put this condition outside the loop, in case we want to check if more than 3 pieces are matched     
        if(verticalSteps >= 3){
            match = true;
        }
        else{
            positions = [];
        }

                
            
        this.swap(firstPosition, secondPosition);
        if(match) {
            return {matched: piece, positions: positions};
        }
        else {
            return undefined;
        }
    }


    addListener(listener: BoardListener<T>) {
    }

    piece(p: Position): T | undefined {
        if(p.row < 0 || p.row >= this.height || p.col < 0 || p.col >= this.width) {
            return undefined;
        }
        return this.pieces[p.row][p.col];
    }

    canMove(first: Position, second: Position): boolean {
        //does not count the piece that is moved away
        if(first.row == second.row && first.col == second.col) {
            return false;
        }

        //recognizes out-of-bounds moves as invalid
        if(this.piece(first) == undefined || this.piece(second) == undefined) {
            return false;
        }

        //recognizes moves on different rows and columns as invalid
        if(first.row != second.row && first.col != second.col) {
            return false;
        }

        // let firstPiece = this.piece(first);
        // let secondPiece = this.piece(second);
        // console.log("FIRST");
        // console.log(this.match(first, second));
        // console.log("SECOND");
        // console.log(this.match(second, first));
        
        //does not allow moves that make no matches
        if((this.match(first, second) == undefined) && (this.match(second, first)== undefined)) {
            return false;
        }

        //if none of the above conditions are met, the move is allowed
        return true;


    }
    
    move(first: Position, second: Position) {
        if(this.canMove(first, second)) {
            let firstPiece = this.piece(first);
            let secondPiece = this.piece(second);
            this.pieces[first.row][first.col] = secondPiece;
            this.pieces[second.row][second.col] = firstPiece;
        }
    }
}

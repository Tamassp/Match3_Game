export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {
    kind: 'Match' | 'Refill'
    match?: Match<T>
}

export type BoardListener<T> = (e: BoardEvent<T>) => any

export class Board<T> {
    generator: Generator<T>;
    height: number
    width: number
    //check if this type is correct
    pieces: T[][]

    //listeners: BoardListener<T>[] = [];
    listener: BoardListener<T> | undefined;

    constructor(generator: Generator<T>,  width: number, height: number) {
        this.generator = generator;
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
    /*match(firstPosition: Position, secondPosition: Position ): Match<T> | undefined {
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
    }*/

    findMatch (): Match<T> | undefined {
        let match: Boolean = false;
        let positions: Position[] = [];
        let piece: T;
        let steps = 0;

        const reset = () => {
            positions = [];
            steps = 0;
        }
        //HORIZONTAL CHECK
        for(let row = 0; row < this.height; row++) {
            let lastPiece = this.piece({row: row, col: 0});
            for(let col = 1; col < this.width; col++) {
                if(this.piece({row: row, col: col}) == lastPiece) {
                    positions.push({row: row, col: col-1});
                    steps++;
                    if(steps >= 2) {
                        piece = lastPiece;
                        positions.push({row: row, col: col});
                        return {matched: piece, positions: positions};
                    }
                }
                else {
                    if(steps >= 2) {
                        piece = lastPiece;
                        return {matched: piece, positions: positions};
                    }
                    else {
                        positions = [];
                        steps = 0;
                    }
                }
                lastPiece = this.piece({row: row, col: col});
                
            }
            reset();
        }
        
        //VERTICAL CHECK
        piece = undefined;
        reset();
        for(let col = 0; col < this.width; col++) {
            let lastPiece = this.piece({row: 0, col: col});
            for(let row = 1; row < this.height; row++) {
                if(this.piece({row: row, col: col}) == lastPiece) {
                    positions.push({row: row -1, col: col});
                    steps++;
                    if(steps >= 2) {
                        piece = lastPiece;
                        positions.push({row: row, col: col});
                        return {matched: piece, positions: positions};
                    }
                }
                else {
                    if(steps >= 2) {
                        piece = lastPiece;
                        return {matched: piece, positions: positions};
                    }
                    else {
                        reset();
                    }
                }
                lastPiece = this.piece({row: row, col: col});
            }
            reset();
        }
        return undefined;
    }

    removePieces(positions: Position[] | undefined) {
        if(positions == undefined) {
            return;
        }
        // for(let i = 0; i < positions.length; i++) {
        //     this.pieces[positions[i].row][positions[i].col] = undefined;
        // }
        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = 0; j < this.width; j++) {
                if (!this.pieces[i][j]) {
                    for (let k = i; k > 0; k--) {
                        this.pieces[i][j] = this.pieces[k - 1][j];
                        this.pieces[k - 1][j] = null;
                        if (this.pieces[i][j]) break;
                    }
                }
            }
        }
    }

    refill() {
        for(let row = 0; row < this.height; row++) {
            for(let col = 0; col < this.width; col++) {
                if(this.pieces[row][col] == undefined) {
                    this.pieces[row][col] = this.generator.next();
                }
            }
        }
    }


    //listener --> is the object that will be notified when the event occurs
    addListener(listener: BoardListener<T>) {
        //this.listeners.push(listener);
        this.listener = listener;
    }

    //onMatch(listener: MatchListener<T>) {
    private eventHandler<T>() {
        const match = this.findMatch();
        if(this.listener) {
            this.listener({kind: 'Match', match: match})
        }
        match.positions.forEach(position => {
            this.pieces[position.row][position.col] = undefined;
        });
        this.removePieces(match.positions);
        this.refill();
        if(this.listener) {
            this.listener({kind: 'Refill'})
        }

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
        
        //does not allow moves that make no matches
        this.swap(first, second);
        if(this.findMatch() === undefined) {
            this.swap(first, second);
            return false;
        }
        else {
            console.log("MATCH:");
            console.log(this.findMatch());
            this.swap(first, second);
            return true;
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
            this.eventHandler();
            
            // const event = new CustomEvent<BoardEvent<T>>('boardListener', {detail: {kind: 'Match', match: this.findMatch()}});
            // dispatchEvent(event);

            //const event = new BoardEvent('Match', this.findMatch());
            //this.boardListener(event);
        }
    }
}

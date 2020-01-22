import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';

const Container = styled.div`
    display: flex;
`;

class App extends React.Component{
    state = {...initialData,
            "totalFile": 0
    };

    getRepo = async (url) => {
        const response = await fetch(url)
        this.setState({totalFile: response.headers.get('X-Total')})
    };

    componentWillMount(){
        this.getRepo('https://gitlab.com/api/v4/projects/16466313/repository/tree?recursive=true&ref=master&per_page=1000')
    }

    onDragStart = (start) => {
        document.body.style.color = 'orange';
        document.body.style.transition = 'background-color 0.2s ease';

        const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);

        this.setState({
            homeIndex,
        });
    }

    onDragUpdate = (update, snap) => {
        const { destination } = update;
        console.log(destination)
        console.log(snap)
        const opacity = destination
            ? destination.index / Object.keys(this.state.tasks).length
            : 0;
        document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
    }

    onDragEnd = result => {
        this.setState({
            homeIndex: null,
        })

        document.body.style.color = 'inherit';
        document.body.style.backgroundColor = 'inherit';

        const { destination, source, draggableId, type } = result;
        console.log(result)

        if(!destination){
            return
        }

        if(destination.droppableId === source.droppableId &&
            destination.index === source.index){
                return;
        }

        if(type === 'column'){
            const newColumnOrder = Array.from(this.state.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            const newState = {
                ...this.state,
                columnOrder: newColumnOrder,
            }
            this.setState(newState);
            return;
        }

        const start = this.state.columns[source.droppableId];
        const finish  = this.state.columns[destination.droppableId];
        
        if(start === finish){
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);
    
            const newColumn = {
                ...start,
                taskIds: newTaskIds,
            };
    
            const newState ={
                ...this.state,
                columns: {
                    ...this.state.columns,
                    [newColumn.id]: newColumn,
                }
            }
            this.setState(newState);
            return;
        }

        // moving from one list to another
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
            ...start,
            taskIds: startTaskIds,
        };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds,
        };

        const newState = {
            ...this.state,
            columns: {
                ...this.state.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        };
        this.setState(newState);
    }

    render() {
        const { totalFile } = this.state
        const items = [...Array(Number(totalFile)).keys()]
        return (
            <div>
            Anime: Tate no Yuusha
            {items && items.map(e => {
            return (<div>
            <video width="320" height="240" controls>
                <source src={`https://gitlab.com/github-flix1/tate-no-yuusha-no-nariagari/parte1/raw/master/${e+1}.mp4`} 
                type="video/mp4"></source>
            </video>
            </div>);
            })}
            
        <DragDropContext
            onDragEnd={this.onDragEnd}
            onDragStart={this.onDragStart}
            onDragUpdate={this.onDragUpdate}
        >
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {provided => (
                    <Container
                        {...provided.droppableProps}
                        innerRef={provided.innerRef}
                        ref={provided.innerRef}>
                        {this.state.columnOrder.map((columnId, index) => {
                            const column = this.state.columns[columnId];
                            const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

                            const isDropDisabled = index < this.state.homeIndex;


                            return <Column key={column.id} column={column} tasks={tasks} isDropDisabled={isDropDisabled} index={index}/>;
                        })}
                        {provided.placeholder}
                    </Container>
                )}
            </Droppable>
        </DragDropContext>
        </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

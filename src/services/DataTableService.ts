import {Category, Priority, Status, Todo} from "../objects/todo";
import {Injectable} from "@angular/core";

@Injectable({ providedIn: "root" })
export class DataTableService {
    public categories: Category[] = [new Category('None')];
    public todos: Todo[] = [];

    public showExtraButtons = { key: "setting_showExtraButtons", description: "Show add buttons", enabled: true };
    public sortList = { key: "setting_sortList", description: "Sort lists", enabled: true };

    public catName = "";
    public selected: Category | undefined;
    public _messageBoxMessage: { message: string, red: boolean } | undefined;

    constructor() {
        this.loadLocalStorage();
    }

    private loadLocalStorage(): void {
        this.loadCategories();
        this.loadTodos();
        this.loadSettings();
    }

    private loadCategories(): void {
        const localCategories = localStorage.getItem("categories");
        if (localCategories !== null) {
            const list: Category[] = JSON.parse(localCategories);
            list.forEach(category => {
                if (!this.categories.find(e => e.name === category.name)) {
                    this.categories.push(new Category(category.name));
                }
            });
        }
    }

    private loadTodos(): void {
        const localTodos = localStorage.getItem("todos");
        if (localTodos !== null) {
            const list: Todo[] = JSON.parse(localTodos);
            list.forEach(t => {
                const c: Category | undefined = this.categories.find(e => e.name === t.category?.name);
                if (c === undefined) {
                    return;
                }
                const todo = new Todo(t.id, t.name, t.until, c!);
                if (t.priority.id === 0) {
                    todo.priority = Priority.UNASSIGNED;
                }
                // ... (similar conversion for priority and status)
                this.todos.push(todo);
            });
        }
    }

    private loadSettings(): void {
        this.loadSetting(this.showExtraButtons);
        this.loadSetting(this.sortList);
    }

    private loadSetting(setting: { key: string, description: string, enabled: boolean }): void {
        const storedSetting = localStorage.getItem(setting.key);
        if (storedSetting !== null) {
            setting.enabled = JSON.parse(storedSetting);
        }
    }

    public set messageBoxMessage(message: { message: string, red: boolean }) {
        this._messageBoxMessage = message;
        this.clearMessageBoxAfterDelay(message);
    }

    private clearMessageBoxAfterDelay(message: { message: string, red: boolean }): void {
        new Promise(resolve => setTimeout(resolve, 3000)).then(d => {
            if (this._messageBoxMessage === message) {
                this._messageBoxMessage = undefined;
            }
        });
    }

    public get messageBoxMessage(): { message: string, red: boolean } | undefined {
        return this._messageBoxMessage;
    }

    public saveSetting(obj: { key: string, description: string, enabled: boolean }): void {
        localStorage.setItem(obj.key, JSON.stringify(!obj.enabled));
    }

    public addCategory(): void {
        if (this.catName.length === 0) {
            this.messageBoxMessage = { message: "Dont leave the textbox empty", red: true };
            return;
        }
        if (this.categories.find(e => e.name === this.catName) !== undefined) {
            this.messageBoxMessage = { message: "Already existing category", red: true };
            return;
        }
        this.categories.push(new Category(this.catName));
        this.messageBoxMessage = { message: "Category added", red: false };
        localStorage.setItem("categories", JSON.stringify(this.categories));
        this.catName = "";
    }

    public removeCategory(category: Category): void {
        this.categories = this.categories.filter(e => e !== category);
        this.messageBoxMessage = { message: "Category deleted", red: false };
        localStorage.setItem("categories", JSON.stringify(this.categories));
        this.todos.forEach(todo => {
            if (todo.category === category) {
                todo.category = this.categories[0];
            }
        });
        this.save();
    }

    public findNextId(): number {
        const list: number[] = this.todos.map(todo => todo.id);
        let i = 1;
        while (list.includes(i)) {
            i++;
        }
        return i;
    }

    public delete(todo: Todo): void {
        this.todos = this.todos.filter(e => e !== todo);
        this.save();
        this.messageBoxMessage = { message: "deleted", red: false };
    }

    public add(todo: Todo): void {
        this.todos.push(todo);
        this.save();
        this.messageBoxMessage = { message: "Todo added", red: false };
    }

    public save(): void {
        localStorage.setItem("todos", JSON.stringify(this.todos));
    }

    public todoList(): Todo[] {
        let a = this.todos;
        if (this.sortList.enabled) {
            a = a.sort((a, b) => {
                if (a.status.id !== b.status.id) {
                    return b.status.id - a.status.id;
                }
                if (a.priority.id !== b.priority.id) {
                    return b.priority.id - a.priority.id;
                }
                return a.id - b.id;
            });
        }
        if (this.selected !== undefined) {
            a = a.filter(todo => todo.category === this.selected);
        }
        return a;
    }
}

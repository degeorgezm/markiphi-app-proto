import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/_models/product';
import { Department } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {

    @Input() products: Product[] = [];
    @Input() department: any[] = [];

    public departments: Department[] = [];
    public loaded: boolean = false;

    @Output() departmentsFilter: EventEmitter<any> = new EventEmitter<any>();

    public collapse: boolean = true;

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        let url = environment.API_URL + "/departments";

        this.http.get(url, {
            observe: 'response'
        }).subscribe(
            success => {
                let body: any = success.body;

                body.forEach(element => {
                    let department = Department.fromJSON(element);
                    this.departments.push(department);
                });

                this.loaded = true;
            }
        )
    }

    get filterbydepartment() {
        const uniquedepartments = [];
        this.products.filter((product) => {
            if (product.department) {
                const index = uniquedepartments.indexOf(product.department.name)
                if (index === -1) uniquedepartments.push(product.department.name)
            }
        })
        return uniquedepartments
    }

    filterIdByName(name): string {
        if (this.loaded == true) {
            let filtered = this.departments.filter(element => element.name == name);
            return filtered[0]._id;
        } else {
            return "";
        }
    }

    appliedFilter(event) {
        let index = this.department.indexOf(event.target.value);  // checked and unchecked value
        if (event.target.checked)
            this.department.push(event.target.value); // push in array cheked value
        else
            this.department.splice(index, 1);  // removed in array unchecked value  

        let brands = this.department.length ? { department: this.department.join(",") } : { department: null };
        this.departmentsFilter.emit(brands);
    }

    // check if the item are selected
    checked(item) {
        if (this.department.indexOf(item) != -1) {
            return true;
        }
    }

}

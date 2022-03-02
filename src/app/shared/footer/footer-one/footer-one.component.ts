import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer-one',
  templateUrl: './footer-one.component.html',
  styleUrls: ['./footer-one.component.scss']
})
export class FooterOneComponent implements OnInit {

  @Input() class: string = 'footer-light' // Default class 
  @Input() themeLogo: string = 'assets/images/icon/logo.png' // Default Logo
  @Input() newsletter: boolean = true; // Default True

  @ViewChild('email', { static: false }) f: ElementRef;

  public today: number = Date.now();

  constructor(private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSubmit(value) {
    console.log(value);
    this.toastr.success("You have successfully added your email to our newsletter!", "Success");
    this.f.nativeElement.value = "";
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() title: string;
  @Input() breadcrumb: string;

  constructor(private appAuthService: AppAuthenticationService) {
  }

  ngOnInit(): void {
  }

}

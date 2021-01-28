import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Phase, PhaseService } from '../../../../../src/app/core/services/phase.service';
import { User, UserRole } from '../../../../../src/app/core/models/user.model';

import {
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { AssigneeComponent } from '../../../../../src/app/shared/issue/assignee/assignee.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ErrorHandlingService } from '../../../../../src/app/core/services/error-handling.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { IssueService } from '../../../../../src/app/core/services/issue.service';
import { MatSelect } from '@angular/material/select';
import { MaterialModule } from '../../../../../src/app/shared/material.module';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { Team } from '../../../../../src/app/core/models/team.model';
import { UserService } from '../../../../../src/app/core/services/user.service';

describe('AssigneeComponent', () => {
  let component: AssigneeComponent;
  let debugElement: DebugElement;
  let fixture: ComponentFixture<AssigneeComponent>;
  let childFixture: ComponentFixture<MatSelect>;

  const testStudent: User = {
      loginId: 'testStudent',
      role: UserRole.Student
  };

  const dummyTeam = new Team({
      id: 'F09-2',
      teamMembers: [ testStudent ],
  });
  const dummyIssue: Issue =  Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);

  const userService: UserService = new UserService(null, null);
  userService.currentUser = testStudent;
  const phaseService: PhaseService = new PhaseService(null, null, null, userService, null);
  phaseService.currentPhase = Phase.phaseTeamResponse;
  const permissionsService: PermissionService = new PermissionService(null, userService, phaseService);
  const issueService: IssueService = new IssueService(null, userService, phaseService, permissionsService, null, null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssigneeComponent
      ],
      providers: [
        UserService, IssueService, ErrorHandlingService, PhaseService, PermissionService
      ],
      imports: [
        FormsModule, MaterialModule, ApolloTestingModule, HttpClientModule, BrowserAnimationsModule
      ]
    })
    .overrideProvider(UserService, { useValue: userService })
    .overrideProvider(PhaseService, { useValue: phaseService })
    .overrideProvider(IssueService, { useValue: issueService })
    .overrideProvider(PermissionService, { useValue: permissionsService })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigneeComponent);
    component = fixture.componentInstance;

    childFixture = TestBed.createComponent(MatSelect);
    component.assigneeSelection = childFixture.componentInstance;
    component.team = dummyTeam;
    component.issue = dummyIssue;
    fixture.detectChanges();

    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to see the placeholder value', () => {
    // Expect a Placeholder Value to be defined if no assignees
    const matPlaceholderValue: HTMLElement = debugElement.query(By.css('.mat-select-placeholder')).nativeElement;
    expect(matPlaceholderValue).toBeDefined();
    expect(matPlaceholderValue.innerText).toEqual('-'); // Placeholder Value
  });

  it('should be able to open the assignee selector', () => {
    const matSelect: HTMLElement = debugElement.query(By.css('.mat-select-trigger')).nativeElement;

    // Open the assignee Selector
    matSelect.click();
    fixture.detectChanges();
    const matOption: HTMLElement = debugElement.query(By.css('.mat-option')).nativeElement;
    const inputElement: HTMLElement = debugElement.query(By.css('.mat-select-panel')).nativeElement;
    const matOptionAttributes = matOption.attributes;
    const inputElementOptions = inputElement.children;

    expect(inputElementOptions.length).toBe(dummyTeam.teamMembers.length);
    expect(matOptionAttributes.getNamedItem('aria-selected').value).toEqual('false');
  });

  it('should be able to assign a new assignee', () => {
    const matSelect: HTMLElement = debugElement.query(By.css('.mat-select-trigger')).nativeElement;

    // Open the Assignee Selector
    matSelect.click();
    fixture.detectChanges();
    const matOption: HTMLElement = debugElement.query(By.css('.mat-option')).nativeElement;
    const matOptionAttributes = matOption.attributes;

    // Assign a new assignee
    matOption.click();
    fixture.detectChanges();
    expect(matOptionAttributes.getNamedItem('aria-selected').value).toEqual('true');
    expect(component.assignees).toEqual(component.teamMembers);

    const textValue: HTMLElement = debugElement.query(By.css('.mat-select-value-text')).nativeElement;
    expect(textValue).toBeDefined();
  });
});